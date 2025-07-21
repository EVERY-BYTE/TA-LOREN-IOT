import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase/db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Divider,
  Paper,
} from "@mui/material";

interface SensorDataItem {
  timestamp: number;
  value: number;
  time: string;
}

type SensorType = "ph" | "tds" | "temperature";

type SensorDataMap = Record<SensorType, SensorDataItem[]>;

const sensorTypes: SensorType[] = ["ph", "tds", "temperature"];

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState<SensorDataMap>({
    ph: [],
    tds: [],
    temperature: [],
  });
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    sensorTypes.forEach((sensor) => {
      const sensorRef = ref(db, `sensors/${sensor}`);
      onValue(sensorRef, (snapshot) => {
        const rawData = snapshot.val() || {};

        const parsedData: SensorDataItem[] = Object.values(rawData)
          .map((item: any) => ({
            timestamp: item.timestamp,
            value: item.value,
            time: format(
              new Date(item.timestamp * 1000),
              "yyyy-MM-dd HH:mm:ss"
            ),
          }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-50);

        setSensorData((prev) => ({ ...prev, [sensor]: parsedData }));
      });
    });
  }, []);

  const filterData = (data: SensorDataItem[]): SensorDataItem[] => {
    if (!startDate || !endDate) return data;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return data.filter(
      (d) => d.timestamp * 1000 >= start && d.timestamp * 1000 <= end
    );
  };

  const exportToExcel = () => {
    const allData: Record<string, { Time: string; Value: number }[]> =
      sensorTypes.reduce((acc, sensor) => {
        const data = filterData(sensorData[sensor]);
        acc[sensor] = data.map((item) => ({
          Time: item.time,
          Value: item.value,
        }));
        return acc;
      }, {} as Record<string, { Time: string; Value: number }[]>);

    const wb = XLSX.utils.book_new();
    sensorTypes.forEach((sensor) => {
      const ws = XLSX.utils.json_to_sheet(allData[sensor]);
      XLSX.utils.book_append_sheet(wb, ws, sensor.toUpperCase());
    });
    XLSX.writeFile(wb, "SensorData.xlsx");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Sensor Monitoring
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={exportToExcel}
              fullWidth
              size="small"
              sx={{ py: 1 }}
            >
              Export to Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {sensorTypes.map((sensor) => (
          <Grid item xs={12} key={sensor}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  {sensor.toUpperCase()} Chart
                </Typography>
                <Box height={350}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filterData(sensorData[sensor])}
                      margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        angle={-15}
                        height={50}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1976d2"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
