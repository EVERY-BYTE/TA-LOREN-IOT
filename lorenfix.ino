#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SD.h>
#include <SPI.h>
#include <RTClib.h>   // Library RTC (DS3231 / DS1307)

/* =====================================================================
 *  pH & TDS Monitor + Suhu + SD Logging + RTC Timestamp (ESP32)
 *  -------------------------------------------------------------------
 *  Fitur:
 *    - Baca pH (analog)
 *    - Baca TDS (analog)
 *    - Baca suhu air via DS18B20 (digital 1-Wire)
 *    - Simpan data per 10 menit ke SD card dengan timestamp dari RTC
 *    - Indikator penyimpanan di LCD (ON saat berhasil save)
 *    - Perintah Serial:
 *         kalibratePH <nilaiPH>
 *         setRTC YYYY-MM-DD HH:MM:SS
 *
 *  Format File:
 *    Tanggal,Bulan,Jam,pH,TDS,Suhu
 *    contoh: 20,07,14:23,6.82,250,26.5
 * ===================================================================== */

// === Pin Konfigurasi ===
#define TDS_SENSOR_PIN 34
#define PH_SENSOR_PIN 35
#define BUZZER_PIN 14
#define ONE_WIRE_BUS 5
#define SD_CS_PIN 4

// === Tegangan & ADC ===
#define VREF 3.3
#define ADC_MAX 4095.0

// === Threshold & Kalibrasi ===
#define MAX_TDS 500.0
float tdsCalibrationFactor = 1.0;
float phCalibrationOffset = 0.0;
float phTemperatureComp = 0.03;

// === Logging ===
const char *LOG_FILENAME = "/data_log.csv";
const char LOG_DELIM = ',';
const char *LOG_HEADER = "Tanggal,Bulan,Jam,pH,TDS,Suhu";

// === Objek Sensor ===
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
LiquidCrystal_I2C lcd(0x27, 16, 2);
RTC_DS3231 rtc;

bool sdAvailable = false;
File dataFile;

unsigned long lastSaveTime = 0;
const unsigned long saveInterval = 60000UL; // 1 menit

bool lastSaveSuccess = false;
unsigned long saveMsgStart = 0;
const unsigned long saveMsgDuration = 2000UL; // 2 detik

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#define WIFI_SSID "NAMA_WIFI_KAMU"
#define WIFI_PASSWORD "PASSWORD_WIFI_KAMU"

#define API_KEY "AIzaSyBf6qlzdo5PAftRJQGugwH6dYnr6-3jpq0"
#define DATABASE_URL "https://ta-loren-default-rtdb.asia-southeast1.firebasedatabase.app/"

#define FIREBASE_HOST 
#define FIREBASE_AUTH 

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;


void calibratePH(float knownPH, float voltage);
void handleSerialCommands(float lastVoltagePH);
void logData(float phValue, float tdsValue, float temperature);
void showNormalDisplay(float phValue, float tdsValue, float temperature);
void showSaveDisplay(DateTime now, bool ok);
void print2digits(File &f, uint8_t v);
void print2digitsLCD(uint8_t v);
bool headerExistsOrWrite();
void setRTCfromCompileTime();

void setup() {
  Serial.begin(115200);
  delay(100);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  lcd.begin();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("pH & TDS Monitor");
  delay(2000);
  lcd.clear();

  sensors.begin();

  // --- RTC ---
  if (!rtc.begin()) {
    Serial.println("RTC tidak terdeteksi!");
  } else if (rtc.lostPower()) {
    Serial.println("RTC kehilangan daya -> set ke waktu kompilasi.");
    setRTCfromCompileTime();
  }

  // --- SD Card ---
  if (SD.begin(SD_CS_PIN)) {
    sdAvailable = true;
    Serial.println("SD Card terdeteksi.");
    headerExistsOrWrite();
  } else {
    Serial.println("SD Card tidak terdeteksi.");
  }

  Serial.println("Perintah Serial:");
  Serial.println("  kalibratePH <nilai>");
  Serial.println("  setRTC YYYY-MM-DD HH:MM:SS");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi Terhubung!");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

}

void loop() {
  // === Baca Sensor ===
  int tdsRaw = analogRead(TDS_SENSOR_PIN);
  float tdsValue = tdsRaw * tdsCalibrationFactor;

  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  int phRaw = analogRead(PH_SENSOR_PIN);
  float voltagePH = phRaw * (VREF / ADC_MAX);
  float phValue = (voltagePH * 14.0 / 3.0) + phCalibrationOffset;
  phValue -= phTemperatureComp * (temperature - 25.0); // kompensasi suhu

  // === Buzzer ===
  digitalWrite(BUZZER_PIN, (tdsValue > MAX_TDS) ? HIGH : LOW);

  // === Serial Commands ===
  handleSerialCommands(voltagePH);

  // === Logging per 1 menit ===
  if (sdAvailable && millis() - lastSaveTime >= saveInterval) {
    logData(phValue, tdsValue, temperature);
    lastSaveTime = millis();
  }

  // === LCD Display ===
  if ((millis() - saveMsgStart) < saveMsgDuration) {
    showSaveDisplay(rtc.now(), lastSaveSuccess);
  } else {
    showNormalDisplay(phValue, tdsValue, temperature);
  }

  delay(10000);
}

// ---------------------------------------------------------------------
//  Logging ke SD Card
// ---------------------------------------------------------------------
void logData(float phValue, float tdsValue, float temperature) {
  lastSaveSuccess = false;
  if (!sdAvailable) return;

  DateTime now = rtc.now();
  dataFile = SD.open(LOG_FILENAME, FILE_APPEND);
  if (!dataFile) {
    saveMsgStart = millis();
    return;
  }

  // Format: Tanggal,Bulan,Jam,pH,TDS,Suhu
  dataFile.print(now.day());           // Tanggal (1-31)
  dataFile.print(LOG_DELIM);
  dataFile.print(now.month());         // Bulan (1-12)
  dataFile.print(LOG_DELIM);
  print2digits(dataFile, now.hour());  // Jam HH:MM
  dataFile.print(':');
  print2digits(dataFile, now.minute());
  dataFile.print(LOG_DELIM);
  dataFile.print(phValue, 2);
  dataFile.print(LOG_DELIM);
  dataFile.print(tdsValue, 0);
  dataFile.print(LOG_DELIM);
  dataFile.println(temperature, 1);
  dataFile.close();

  lastSaveSuccess = true;
  saveMsgStart = millis();

  uploadToFirebase(now, phValue, tdsValue, temperature);

}

// ---------------------------------------------------------------------
//  Tampilan utama (normal)
// ---------------------------------------------------------------------
void showNormalDisplay(float phValue, float tdsValue, float temperature) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("pH:");
  lcd.print(phValue, 2);
  lcd.print(" TDS:");
  lcd.print(tdsValue, 0);

  lcd.setCursor(0, 1);
  lcd.print("Suhu:");
  lcd.print(temperature, 1);
  lcd.write((uint8_t)223);
  lcd.print("C ");

  lcd.setCursor(13, 1);
  lcd.print(sdAvailable ? "SD" : "NO");
}

// ---------------------------------------------------------------------
//  Tampilan singkat setelah simpan data
// ---------------------------------------------------------------------
void showSaveDisplay(DateTime now, bool ok) {
  lcd.clear();
  lcd.setCursor(0, 0);
  // DD/MM HH:MM
  if (now.day() < 10) lcd.print('0');
  lcd.print(now.day());
  lcd.print('/');
  if (now.month() < 10) lcd.print('0');
  lcd.print(now.month());
  lcd.print(' ');
  if (now.hour() < 10) lcd.print('0');
  lcd.print(now.hour());
  lcd.print(':');
  if (now.minute() < 10) lcd.print('0');
  lcd.print(now.minute());

  lcd.setCursor(0, 1);
  lcd.print(ok ? "Data tersimpan" : "Gagal simpan ");
}

// ---------------------------------------------------------------------
//  Util
// ---------------------------------------------------------------------
void print2digits(File &f, uint8_t v) {
  if (v < 10) f.print('0');
  f.print(v);
}

void print2digitsLCD(uint8_t v) {
  if (v < 10) lcd.print('0');
  lcd.print(v);
}

// ---------------------------------------------------------------------
//  Kalibrasi pH
// ---------------------------------------------------------------------
void calibratePH(float knownPH, float voltage) {
  float estimatedPH = voltage * 14.0 / 3.0;
  phCalibrationOffset = knownPH - estimatedPH;
  Serial.print("Kalibrasi selesai. Offset baru: ");
  Serial.println(phCalibrationOffset, 4);
}

// ---------------------------------------------------------------------
//  Serial Commands Parser
// ---------------------------------------------------------------------
void handleSerialCommands(float lastVoltagePH) {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\n');
  line.trim();
  line.replace('\r', ' ');

  if (line.startsWith("kalibratePH")) {
    float inputPH = line.substring(11).toFloat(); // setelah kata
    calibratePH(inputPH, lastVoltagePH);
    return;
  }

  if (line.startsWith("setRTC")) {
    int firstSpace = line.indexOf(' ');
    if (firstSpace < 0) {
      Serial.println("Format salah. Contoh: setRTC 2025-07-20 14:23:00");
      return;
    }
    String dt = line.substring(firstSpace + 1);
    dt.trim();
    if (dt.length() < 19) {
      Serial.println("Format salah. Contoh: setRTC 2025-07-20 14:23:00");
      return;
    }
    int y  = dt.substring(0,4).toInt();
    int m  = dt.substring(5,7).toInt();
    int d  = dt.substring(8,10).toInt();
    int hh = dt.substring(11,13).toInt();
    int mm = dt.substring(14,16).toInt();
    int ss = dt.substring(17,19).toInt();
    rtc.adjust(DateTime(y,m,d,hh,mm,ss));
    Serial.println("RTC diset.");
    return;
  }

  Serial.println("Perintah tidak dikenal.");
}

// ---------------------------------------------------------------------
//  Header File SD
// ---------------------------------------------------------------------
bool headerExistsOrWrite() {
  if (!sdAvailable) return false;

  if (!SD.exists(LOG_FILENAME)) {
    dataFile = SD.open(LOG_FILENAME, FILE_WRITE);
    if (dataFile) {
      dataFile.println(LOG_HEADER);
      dataFile.close();
      return true;
    }
    return false;
  }

  dataFile = SD.open(LOG_FILENAME, FILE_READ);
  if (!dataFile) return false;
  bool needHeader = (dataFile.size() == 0);
  dataFile.close();

  if (needHeader) {
    dataFile = SD.open(LOG_FILENAME, FILE_WRITE);
    if (dataFile) {
      dataFile.println(LOG_HEADER);
      dataFile.close();
      return true;
    }
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------
//  Set RTC dari waktu kompilasi
// ---------------------------------------------------------------------
void setRTCfromCompileTime() {
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  DateTime now = rtc.now();
  Serial.print("RTC -> ");
  Serial.print(now.year()); Serial.print('-');
  Serial.print(now.month()); Serial.print('-');
  Serial.print(now.day()); Serial.print(' ');
  Serial.print(now.hour()); Serial.print(':');
  Serial.print(now.minute()); Serial.print(':');
  Serial.println(now.second());
}


void uploadToFirebase(DateTime now, float ph, float tds, float temp) {
  String timestamp = String(now.unixtime()); 

  FirebaseJson json;
  json.set("timestamp", now.unixtime());
  json.set("value", ph);
  Firebase.RTDB.pushJSON(&fbdo, "/sensors/ph", &json);

  json.set("value", tds);
  Firebase.RTDB.pushJSON(&fbdo, "/sensors/tds", &json);

  json.set("value", temp);
  Firebase.RTDB.pushJSON(&fbdo, "/sensors/temperature", &json);

  Serial.println("Data dikirim ke Firebase.");
}
