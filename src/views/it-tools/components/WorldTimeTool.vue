<template>
  <div class="world-time-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="我的时区">
          <div class="当前时间大">
            {{ currentTime }}
          </div>
          <div class="时区信息">
            <el-icon><Clock /></el-icon>
            {{ currentTimezone }}
          </div>
          <div class="操作区 mt-4">
            <el-button @click="copyTime(currentTime)">复制时间</el-button>
            <el-button @click="copyTimestamp(currentTimestamp)">复制时间戳</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="时间戳">
          <el-input v-model="timestampInput" placeholder="输入时间戳（毫秒）">
            <template #append>
              <el-button @click="timestampToDateTime">转换</el-button>
            </template>
          </el-input>
          <div v-if="convertedTime" class="转换结果 mt-4">
            {{ convertedTime }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="世界时间表" class="mt-4">
      <el-input v-model="baseTime" placeholder="基准时间" class="mb-4">
        <template #prepend>基准时间</template>
        <template #append>
          <el-button @click="setNow">当前时间</el-button>
        </template>
      </el-input>

      <el-table :data="worldTimes" stripe style="width: 100%">
        <el-table-column prop="city" label="城市" width="150" />
        <el-table-column prop="timezone" label="时区" width="180" />
        <el-table-column label="时间">
          <template #default="{ row }">
            <span :class="{ '时间高亮': row.isToday }">{{ row.time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="日期" width="120">
          <template #default="{ row }">
            <span :class="{ '日期高亮': row.dateDiff !== 0 }">
              {{ row.date }}
              <el-tag v-if="row.dateDiff > 0" type="warning" size="small">+{{ row.dateDiff }}天</el-tag>
              <el-tag v-if="row.dateDiff < 0" type="info" size="small">{{ row.dateDiff }}天</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button text type="primary" @click="copyCityTime(row)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card header="时区对照" class="mt-4">
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="UTC 时区" name="utc">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item v-for="tz in utcTimezones" :key="tz.value" :label="tz.label">
              {{ tz.value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title="亚洲时区" name="asia">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item v-for="tz in asiaTimezones" :key="tz.value" :label="tz.label">
              {{ tz.value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title="欧美时区" name="europe">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item v-for="tz in europeTimezones" :key="tz.value" :label="tz.label">
              {{ tz.value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Clock } from '@element-plus/icons-vue';

const currentTime = ref('');
const currentTimestamp = ref('');
const currentTimezone = ref('');
const timestampInput = ref('');
const convertedTime = ref('');
const baseTime = ref('');
const activeCollapse = ref(['utc', 'asia', 'europe']);

let timer: ReturnType<typeof setInterval>;

const worldTimesData = [
  { city: '北京', timezone: 'Asia/Shanghai', label: '中国标准时间' },
  { city: '上海', timezone: 'Asia/Shanghai', label: '中国标准时间' },
  { city: '香港', timezone: 'Asia/Hong_Kong', label: '香港时间' },
  { city: '台北', timezone: 'Asia/Taipei', label: '台北时间' },
  { city: '东京', timezone: 'Asia/Tokyo', label: '日本标准时间' },
  { city: '首尔', timezone: 'Asia/Seoul', label: '韩国标准时间' },
  { city: '新加坡', timezone: 'Asia/Singapore', label: '新加坡时间' },
  { city: '伦敦', timezone: 'Europe/London', label: '格林威治标准时间' },
  { city: '巴黎', timezone: 'Europe/Paris', label: '欧洲中部时间' },
  { city: '柏林', timezone: 'Europe/Berlin', label: '欧洲中部时间' },
  { city: '纽约', timezone: 'America/New_York', label: '东部标准时间' },
  { city: '洛杉矶', timezone: 'America/Los_Angeles', label: '太平洋标准时间' },
  { city: '芝加哥', timezone: 'America/Chicago', label: '中部标准时间' },
  { city: '多伦多', timezone: 'America/Toronto', label: '东部标准时间' },
  { city: '悉尼', timezone: 'Australia/Sydney', label: '澳大利亚东部时间' },
  { city: '莫斯科', timezone: 'Europe/Moscow', label: '莫斯科时间' },
  { city: '迪拜', timezone: 'Asia/Dubai', label: '海湾标准时间' },
  { city: '孟买', timezone: 'Asia/Kolkata', label: '印度标准时间' },
  { city: '曼谷', timezone: 'Asia/Bangkok', label: '印度支那时间' },
  { city: '首尔', timezone: 'Asia/Seoul', label: '韩国标准时间' },
];

const utcTimezones = [
  { label: 'UTC', value: 'UTC' },
  { label: 'UTC-12', value: 'Etc/GMT+12' },
  { label: 'UTC-11', value: 'Etc/GMT+11' },
  { label: 'UTC-8', value: 'Etc/GMT+8' },
  { label: 'UTC-5', value: 'Etc/GMT+5' },
  { label: 'UTC+0', value: 'Etc/GMT' },
  { label: 'UTC+1', value: 'Etc/GMT-1' },
  { label: 'UTC+2', value: 'Etc/GMT-2' },
  { label: 'UTC+3', value: 'Etc/GMT-3' },
  { label: 'UTC+4', value: 'Etc/GMT-4' },
];

const asiaTimezones = [
  { label: '北京', value: 'Asia/Shanghai' },
  { label: '东京', value: 'Asia/Tokyo' },
  { label: '首尔', value: 'Asia/Seoul' },
  { label: '香港', value: 'Asia/Hong_Kong' },
  { label: '台北', value: 'Asia/Taipei' },
  { label: '新加坡', value: 'Asia/Singapore' },
  { label: '曼谷', value: 'Asia/Bangkok' },
  { label: '孟买', value: 'Asia/Kolkata' },
  { label: '迪拜', value: 'Asia/Dubai' },
  { label: '莫斯科', value: 'Europe/Moscow' },
];

const europeTimezones = [
  { label: '伦敦', value: 'Europe/London' },
  { label: '巴黎', value: 'Europe/Paris' },
  { label: '柏林', value: 'Europe/Berlin' },
  { label: '罗马', value: 'Europe/Rome' },
  { label: '阿姆斯特丹', value: 'Europe/Amsterdam' },
  { label: '马德里', value: 'Europe/Madrid' },
  { label: '纽约', value: 'America/New_York' },
  { label: '洛杉矶', value: 'America/Los_Angeles' },
  { label: '芝加哥', value: 'America/Chicago' },
  { label: '多伦多', value: 'America/Toronto' },
];

const worldTimes = ref<any[]>([]);

const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', { hour12: false });
  currentTimestamp.value = now.getTime().toString();
  currentTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  updateWorldTimes();
};

const updateWorldTimes = () => {
  const base = baseTime.value ? new Date(baseTime.value) : new Date();
  const baseDate = base.toDateString();

  worldTimes.value = worldTimesData.map(item => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: item.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat('zh-CN', options);
      const parts = formatter.formatToParts(base);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

      const time = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
      const date = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

      // 计算日期差异
      const baseDays = new Date(baseDate).getTime();
      const targetDate = new Date(date);
      const targetDays = new Date(targetDate.toDateString()).getTime();
      const dateDiff = Math.round((targetDays - baseDays) / (1000 * 60 * 60 * 24));

      return {
        ...item,
        time,
        date,
        dateDiff,
        isToday: dateDiff === 0,
      };
    } catch (e) {
      return { ...item, time: '--:--:--', date: '--:--', dateDiff: 0, isToday: false };
    }
  });
};

const setNow = () => {
  baseTime.value = new Date().toISOString();
  updateWorldTimes();
  ElMessage.success('已设置为当前时间');
};

const timestampToDateTime = () => {
  if (!timestampInput.value) return;
  const ts = parseInt(timestampInput.value);
  if (isNaN(ts)) {
    ElMessage.error('请输入有效的时间戳');
    return;
  }
  const date = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000);
  convertedTime.value = date.toLocaleString('zh-CN');
  ElMessage.success('转换完成');
};

const copyTime = (time: string) => {
  navigator.clipboard.writeText(time);
  ElMessage.success('已复制到剪贴板');
};

const copyTimestamp = (ts: string) => {
  navigator.clipboard.writeText(ts);
  ElMessage.success('已复制到剪贴板');
};

const copyCityTime = (row: any) => {
  const text = `${row.city}: ${row.date} ${row.time}`;
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

onMounted(() => {
  updateCurrentTime();
  setNow();
  timer = setInterval(updateCurrentTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.world-time-tool {
  .当前时间大 {
    font-size: 28px;
    font-weight: bold;
    font-family: monospace;
  }
  .时区信息 {
    margin-top: 10px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .转换结果 {
    font-size: 18px;
    font-weight: bold;
    font-family: monospace;
  }
  .时间高亮 {
    font-weight: bold;
    color: var(--el-color-success);
  }
  .日期高亮 {
    color: var(--el-color-warning);
  }
  .操作区 {
    display: flex;
    gap: 10px;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
  .mt-4 {
    margin-top: 16px;
  }
}
</style>
