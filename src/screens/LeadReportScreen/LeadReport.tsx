/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useToast } from "expo-toast";

import { styles, COLORS } from "./LeadReport.styles";
import Header from "../../components/Header/Header";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import SelectCustom from "../../components/SelectCustom/SelectCustom";
import ReportService, { ICustomerByMonth, IFrequencyItem } from "../../services/ReportService";
import { getToken } from "../../utils/common";

const screenWidth = Dimensions.get("window").width;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const PIE_COLORS = ["#E41F07", "#FFA201", "#1ABE17", "#2F80ED", "#6c757d"];

export default function LeadReportScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<number[]>(new Array(12).fill(0));
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [frequencyData, setFrequencyData] = useState<IFrequencyItem[]>([]);
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { id: y, name: `Năm ${y}` };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Tháng ${i + 1}`,
  }));

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    fetchFrequency();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchMonthlyChart(), fetchSourceChart(), fetchFrequency()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchMonthlyChart = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await ReportService.getCustomerByMonth({ year: selectedYear }, token);
      if (res?.code === 200 && res.result) {
        const filledData = new Array(12).fill(0);
        res.result.forEach((item: ICustomerByMonth) => {
          if (item.month >= 1 && item.month <= 12) {
            filledData[item.month - 1] = item.totalCustomer;
          }
        });
        setMonthlyData(filledData);
      } else {
        setMonthlyData(new Array(12).fill(0));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSourceChart = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await ReportService.getCustomerBySource({ year: selectedYear }, token);
      if (res?.code === 200 && res.result) {
        const formatted = res.result.map((item: any, index: number) => ({
          name: item.sourceName,
          population: item.totalCustomer,
          color: PIE_COLORS[index % PIE_COLORS.length],
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        }));
        setSourceData(formatted);
      } else {
        setSourceData([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFrequency = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await ReportService.getFrequency(
        {
          year: selectedYear,
          month: selectedMonth,
          page: 1,
          size: 20,
        },
        token
      );

      if (res?.code === 200 && res.result) {
        setFrequencyData(res.result.items || []);
      } else {
        setFrequencyData([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderFrequencyItem = (item: IFrequencyItem, index: number) => (
    <View key={index} style={styles.listItem}>
      <View style={styles.itemHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.customerName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.customerName}>{item.customerName}</Text>
      </View>
      <View style={styles.itemBody}>
        <View style={styles.statCol}>
          <Text style={styles.label}>Số hóa đơn</Text>
          <Text style={styles.value}>{item.totalInvoice}</Text>
        </View>
        <View style={styles.statColCenter}>
          <Text style={styles.label}>TB/Hóa đơn</Text>
          <Text style={styles.value}>{formatCurrency(item.avgFee)}</Text>
        </View>
        <View style={styles.statColEnd}>
          <Text style={styles.label}>Tổng chi tiêu</Text>
          <Text style={styles.money}>{formatCurrency(item.totalFee)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={open} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterContainer}>
          <Text style={styles.pageTitle}>Báo cáo & Thống kê</Text>
          <View style={{ width: 120 }}>
            <SelectCustom options={yearOptions} value={selectedYear} onChange={(opt) => setSelectedYear(Number(opt.id))} placeholder="Năm" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Khách hàng theo năm</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
                datasets: [{ data: monthlyData }],
              }}
              width={Math.max(screenWidth - 60, 500)}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(228, 31, 7, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.6,
              }}
              style={{ borderRadius: 8 }}
              showValuesOnTopOfBars
            />
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Nguồn khách hàng</Text>
          </View>
          {sourceData.length > 0 ? (
            <PieChart
              data={sourceData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          ) : (
            <Text style={styles.emptyText}>Chưa có dữ liệu nguồn khách hàng</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={[styles.cardHeader, { borderBottomWidth: 0, marginBottom: 0 }]}>
            <Text style={styles.cardTitle}>Tần suất mua hàng</Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <SelectCustom
              options={monthOptions}
              value={selectedMonth}
              onChange={(opt) => setSelectedMonth(Number(opt.id))}
              placeholder="Chọn tháng"
            />
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <View>
              {frequencyData.length > 0 ? (
                frequencyData.map((item, index) => renderFrequencyItem(item, index))
              ) : (
                <Text style={styles.emptyText}>Không có dữ liệu trong tháng này</Text>
              )}
            </View>
          )}

          {frequencyData.length > 0 && (
            <Text style={{ textAlign: "center", color: COLORS.textGray, fontSize: 12, marginTop: 8 }}>
              Hiển thị {frequencyData.length} kết quả hàng đầu
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
