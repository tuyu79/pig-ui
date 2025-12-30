<template>
  <div class="timestamp-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="时间戳 → 日期">
          <el-form label-position="top">
            <el-form-item label="时间戳（毫秒/秒）">
              <el-input
                v-model="timestamp"
                placeholder="输入时间戳"
                clearable
              >
                <template #append>
                  <el-select v-model="timestampUnit" style="width: 80px">
                    <el-option label="毫秒" value="ms" />
                    <el-option label="秒" value="s" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="日期格式">
              <el-select v-model="dateFormat" style="width: 100%">
                <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                <el-option label="YYYY/MM/DD HH:mm:ss" value="YYYY/MM/DD HH:mm:ss" />
                <el-option label="ISO 8601" value="ISO" />
              </el-select>
            </el-form-item>
            <el-button type="primary" @click="timestampToDate">转换</el-button>
          </el-form>
          <div v-if="dateResult" class="结果展示">
            <el-input v-model="dateResult" readonly>
              <template #append>
                <el-button @click="copyText(dateResult)">复制</el-button>
              </template>
            </el-input>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="日期 → 时间戳">
          <el-form label-position="top">
            <el-form-item label="日期时间">
              <el-date-picker
                v-model="dateValue"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
                @change="dateToTimestamp"
              />
            </el-form-item>
            <el-form-item label="或直接输入日期">
              <el-input
                v-model="dateString"
                placeholder="YYYY-MM-DD HH:mm:ss"
                @blur="parseDateString"
              />
            </el-form-item>
          </el-form>
          <div v-if="timestampResult" class="结果展示">
            <el-row :gutter="10">
              <el-col :span="16">
                <el-input v-model="timestampResult" readonly placeholder="毫秒时间戳" />
              </el-col>
              <el-col :span="8">
                <el-button @click="copyText(timestampResult)">复制</el-button>
              </el-col>
            </el-row>
            <el-input
              v-model="timestampResultSeconds"
              readonly
              placeholder="秒时间戳"
              class="mt-2"
            >
              <template #append>
                <el-button @click="copyText(timestampResultSeconds)">复制</el-button>
              </template>
            </el-input>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="当前时间" class="当前时间 mt-4">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="时间显示">
            <span class="时间值">{{ currentTime }}</span>
            <el-button size="small" @click="refreshTime">刷新</el-button>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="时间显示">
            <span class="时间值">{{ currentTimestamp }}</span>
            <el-button size="small" @click="copyText(currentTimestamp)">复制</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

const timestamp = ref('');
const timestampUnit = ref('ms');
const dateFormat = ref('YYYY-MM-DD HH:mm:ss');
const dateResult = ref('');

const dateValue = ref('');
const dateString = ref('');
const timestampResult = ref('');
const timestampResultSeconds = ref('');

const currentTime = ref('');
const currentTimestamp = ref('');
let timer: ReturnType<typeof setInterval>;

const timestampToDate = () => {
  if (!timestamp.value) return;
  const ts = timestampUnit.value === 'ms' ? parseInt(timestamp.value) : parseInt(timestamp.value) * 1000;
  const date = new Date(ts);

  let format = dateFormat.value;
  if (format === 'ISO') {
    dateResult.value = date.toISOString();
  } else {
    const pad = (n: number) => n.toString().padStart(2, '0');
    format = format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', pad(date.getMonth() + 1))
      .replace('DD', pad(date.getDate()))
      .replace('HH', pad(date.getHours()))
      .replace('mm', pad(date.getMinutes()))
      .replace('ss', pad(date.getSeconds()));
    dateResult.value = format;
  }
};

const dateToTimestamp = () => {
  if (!dateValue.value) return;
  const ts = new Date(dateValue.value as Date).getTime();
  timestampResult.value = ts.toString();
  timestampResultSeconds.value = Math.floor(ts / 1000).toString();
};

const parseDateString = () => {
  if (!dateString.value) return;
  const date = new Date(dateString.value);
  if (isNaN(date.getTime())) {
    ElMessage.error('日期格式不正确');
    return;
  }
  const ts = date.getTime();
  timestampResult.value = ts.toString();
  timestampResultSeconds.value = Math.floor(ts / 1000).toString();
};

const refreshTime = () => {
  updateCurrentTime();
};

const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', { hour12: false });
  currentTimestamp.value = now.getTime().toString();
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

onMounted(() => {
  updateCurrentTime();
  timer = setInterval(updateCurrentTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.timestamp-tool {
  .结果展示 {
    margin-top: 15px;
  }
  .mt-2 {
    margin-top: 10px;
  }
  .mt-4 {
    margin-top: 16px;
  }
  .当前时间 {
    .时间显示 {
      display: flex;
      align-items: center;
      gap: 15px;
      .时间值 {
        font-size: 18px;
        font-weight: bold;
        font-family: monospace;
      }
    }
  }
}
</style>
