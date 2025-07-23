#include <WiFi.h>
#include <FirebaseESP32.h>
#include <WiFiUdp.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Ganti kredensial kamu
#define WIFI_SSID "NAMA_WIFI"
#define WIFI_PASSWORD "PASSWORD_WIFI"

#define FIREBASE_HOST "https://ta-loren-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "AIzaSyBf6qlzdo5PAftRJQGugwH6dYnr6-3jpq0"

// Pin sensor
#define TDS_SENSOR_PIN 2
#define PH_SENSOR_PIN 35
#define BUZZER_PIN 14
#define ONE_WIRE_BUS 4

#define VREF 3.3
#define ADC_MAX 4095.0
#define MAX_TDS 500.0

// Kalibrasi
float tdsCalibrationFactor = 1.0;
float phCalibrationOffset = 0.0;
float phTemperatureComp = 0.03;

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // Waktu Indonesia Barat (WIB)
const int daylightOffset_sec = 0;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
FirebaseData firebaseData;

void calibratePH(float knownPH, float voltage);

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  sensors.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nTerhubung ke WiFi");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    Serial.print("Waktu saat ini: ");
    Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  } else {
    Serial.println("Gagal mendapatkan waktu NTP.");
  }

  Serial.println("Ketik perintah: kalibratePH [nilai pH]");
}

void loop() {
  int tdsRaw = analogRead(TDS_SENSOR_PIN);
  float tdsValue = tdsRaw * tdsCalibrationFactor;

  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  int phRaw = analogRead(PH_SENSOR_PIN);
  float voltagePH = phRaw * (VREF / ADC_MAX);
  float phValue = (voltagePH * 14.0 / 3.0) + phCalibrationOffset;
  float tempDiff = temperature - 25.0;
  phValue -= (phTemperatureComp * tempDiff);

  struct tm timeinfo;
  time_t epochTime;
  if (getLocalTime(&timeinfo)) {
    epochTime = mktime(&timeinfo);
  } else {
    epochTime = millis() / 1000;
    Serial.println("Gagal dapat NTP time, fallback ke millis.");
  }

  Serial.printf("TDS: %.2f, Suhu: %.2f, pH: %.2f, Time: %lu\n", tdsValue, temperature, phValue, epochTime);

  digitalWrite(BUZZER_PIN, tdsValue > MAX_TDS ? HIGH : LOW);

  FirebaseJson tdsJson;
  tdsJson.set("value", tdsValue);
  tdsJson.set("timestamp", (unsigned long)epochTime);
  Firebase.pushJSON(firebaseData, "/sensors/tds", tdsJson);

  FirebaseJson tempJson;
  tempJson.set("value", temperature);
  tempJson.set("timestamp", (unsigned long)epochTime);
  Firebase.pushJSON(firebaseData, "/sensors/temperature", tempJson);

  FirebaseJson phJson;
  phJson.set("value", phValue);
  phJson.set("timestamp", (unsigned long)epochTime);
  Firebase.pushJSON(firebaseData, "/sensors/ph", phJson);

  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command.startsWith("kalibratePH")) {
      float inputPH = command.substring(12).toFloat();
      calibratePH(inputPH, voltagePH);
    }
  }

  delay(60000); // Setiap 1 menit
}

void calibratePH(float knownPH, float voltage) {
  float estimatedPH = voltage * 14.0 / 3.0;
  phCalibrationOffset = knownPH - estimatedPH;
  Serial.print("Offset pH baru: ");
  Serial.println(phCalibrationOffset, 4);
}
