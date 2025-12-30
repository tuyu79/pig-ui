<template>
  <div class="cron-tool">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card header="Cron 表达式生成">
          <el-input v-model="cronExpression" placeholder="* * * * *" size="large">
            <template #append>
              <el-button @click="generateRandom">随机生成</el-button>
            </template>
          </el-input>

          <el-tabs v-model="activeTab" class="mt-4">
            <el-tab-pane label="秒" name="second">
              <el-radio-group v-model="cron.second.type">
                <el-radio value="*">每秒 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value="/">步长</el-radio>
                <el-radio value=",">列表</el-radio>
              </el-radio-group>
              <div v-if="cron.second.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.second.start" placeholder="开始" style="width: 100px" /> -
                <el-input v-model="cron.second.end" placeholder="结束" style="width: 100px" />
              </div>
              <div v-if="cron.second.type === '/'" class="步长输入 mt-2">
                从 <el-input v-model="cron.second.start" placeholder="开始" style="width: 100px" /> 秒开始，每
                <el-input v-model="cron.second.step" placeholder="步长" style="width: 80px" /> 秒一次
              </div>
              <div v-if="cron.second.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.second.list" placeholder="如: 0,5,10,15" style="width: 300px" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="分钟" name="minute">
              <el-radio-group v-model="cron.minute.type">
                <el-radio value="*">每分钟 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value="/">步长</el-radio>
                <el-radio value=",">列表</el-radio>
              </el-radio-group>
              <div v-if="cron.minute.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.minute.start" placeholder="开始" style="width: 100px" /> -
                <el-input v-model="cron.minute.end" placeholder="结束" style="width: 100px" />
              </div>
              <div v-if="cron.minute.type === '/'" class="步长输入 mt-2">
                从第 <el-input v-model="cron.minute.start" placeholder="开始" style="width: 100px" /> 分钟开始，每
                <el-input v-model="cron.minute.step" placeholder="步长" style="width: 80px" /> 分钟一次
              </div>
              <div v-if="cron.minute.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.minute.list" placeholder="如: 0,5,10,15" style="width: 300px" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="小时" name="hour">
              <el-radio-group v-model="cron.hour.type">
                <el-radio value="*">每小时 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value="/">步长</el-radio>
                <el-radio value=",">列表</el-radio>
              </el-radio-group>
              <div v-if="cron.hour.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.hour.start" placeholder="开始" style="width: 100px" /> -
                <el-input v-model="cron.hour.end" placeholder="结束" style="width: 100px" />
              </div>
              <div v-if="cron.hour.type === '/'" class="步长输入 mt-2">
                从第 <el-input v-model="cron.hour.start" placeholder="开始" style="width: 100px" /> 小时开始，每
                <el-input v-model="cron.hour.step" placeholder="步长" style="width: 80px" /> 小时一次
              </div>
              <div v-if="cron.hour.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.hour.list" placeholder="如: 0,6,12,18" style="width: 300px" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="日" name="day">
              <el-radio-group v-model="cron.day.type">
                <el-radio value="*">每天 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value="/">步长</el-radio>
                <el-radio value=",">列表</el-radio>
                <el-radio value="L">最后一天 (L)</el-radio>
                <el-radio value="W">工作日 (W)</el-radio>
              </el-radio-group>
              <div v-if="cron.day.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.day.start" placeholder="开始" style="width: 100px" /> -
                <el-input v-model="cron.day.end" placeholder="结束" style="width: 100px" />
              </div>
              <div v-if="cron.day.type === '/'" class="步长输入 mt-2">
                从第 <el-input v-model="cron.day.start" placeholder="开始" style="width: 100px" /> 天开始，每
                <el-input v-model="cron.day.step" placeholder="步长" style="width: 80px" /> 天一次
              </div>
              <div v-if="cron.day.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.day.list" placeholder="如: 1,10,15,20" style="width: 300px" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="月" name="month">
              <el-radio-group v-model="cron.month.type">
                <el-radio value="*">每月 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value="/">步长</el-radio>
                <el-radio value=",">列表</el-radio>
              </el-radio-group>
              <div v-if="cron.month.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.month.start" placeholder="开始" style="width: 100px" /> -
                <el-input v-model="cron.month.end" placeholder="结束" style="width: 100px" />
              </div>
              <div v-if="cron.month.type === '/'" class="步长输入 mt-2">
                从第 <el-input v-model="cron.month.start" placeholder="开始" style="width: 100px" /> 月开始，每
                <el-input v-model="cron.month.step" placeholder="步长" style="width: 80px" /> 月一次
              </div>
              <div v-if="cron.month.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.month.list" placeholder="如: 1,4,7,10" style="width: 300px" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="周" name="week">
              <el-radio-group v-model="cron.week.type">
                <el-radio value="*">每周 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value=",">列表</el-radio>
                <el-radio value="#">第几周</el-radio>
                <el-radio value="L">最后一周 (L)</el-radio>
              </el-radio-group>
              <div class="周说明 mt-2">
                0 或 7 = 周日, 1 = 周一, 2 = 周二, ..., 6 = 周六
              </div>
              <div v-if="cron.week.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.week.start" placeholder="开始" style="width: 100px" /> -
                <el-input v-model="cron.week.end" placeholder="结束" style="width: 100px" />
              </div>
              <div v-if="cron.week.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.week.list" placeholder="如: 1,3,5" style="width: 300px" />
              </div>
              <div v-if="cron.week.type === '#'" class="周数字输入 mt-2">
                第 <el-input v-model="cron.week.num" placeholder="周数" style="width: 80px" /> 周的
                <el-input v-model="cron.week.day" placeholder="星期" style="width: 80px" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="年" name="year">
              <el-radio-group v-model="cron.year.type">
                <el-radio value="*">每年 (*)</el-radio>
                <el-radio value="-">区间</el-radio>
                <el-radio value=",">列表</el-radio>
              </el-radio-group>
              <div v-if="cron.year.type === '-'" class="区间输入 mt-2">
                <el-input v-model="cron.year.start" placeholder="开始年份" style="width: 120px" /> -
                <el-input v-model="cron.year.end" placeholder="结束年份" style="width: 120px" />
              </div>
              <div v-if="cron.year.type === ','" class="列表输入 mt-2">
                <el-input v-model="cron.year.list" placeholder="如: 2024,2025,2026" style="width: 300px" />
              </div>
            </el-tab-pane>
          </el-tabs>

          <div class="操作区 mt-4">
            <el-button type="primary" @click="buildCron">生成 Cron</el-button>
            <el-button @click="parseCron">解析 Cron</el-button>
            <el-button @click="clearCron">清空</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card header="执行时间预览">
          <el-button type="primary" @click="calculateNextRuns" class="mb-4">计算下次执行时间</el-button>
          <el-timeline>
            <el-timeline-item v-for="(time, index) in nextRuns" :key="index" :timestamp="time" placement="top">
              第 {{ index + 1 }} 次
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <el-card header="常用示例" class="mt-4">
          <el-descriptions :column="1" size="small">
            <el-descriptions-item>
              <el-link @click="setExample('* * * * *')">* * * * *</el-link>
            </el-descriptions-item>
            <el-descriptions-item>
              <el-link @click="setExample('0 * * * *')">0 * * * *</el-link> - 每小时
            </el-descriptions-item>
            <el-descriptions-item>
              <el-link @click="setExample('0 0 * * *')">0 0 * * *</el-link> - 每天零点
            </el-descriptions-item>
            <el-descriptions-item>
              <el-link @click="setExample('0 0 1 * *')">0 0 1 * *</el-link> - 每月1号
            </el-descriptions-item>
            <el-descriptions-item>
              <el-link @click="setExample('0 0 * * 1')">0 0 * * 1</el-link> - 每周一
            </el-descriptions-item>
            <el-descriptions-item>
              <el-link @click="setExample('0 0 1 1 *')">0 0 1 1 *</el-link> - 每年1月1日
            </el-descriptions-item>
            <el-descriptions-item>
              <el-link @click="setExample('*/5 * * * *')">*/5 * * * *</el-link> - 每5分钟
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-alert v-if="cronError" :title="cronError" type="error" show-icon class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('second');
const cronExpression = ref('* * * * *');
const cronError = ref('');
const nextRuns = ref<string[]>([]);

const cron = reactive({
  second: { type: '*', start: '0', end: '59', step: '1', list: '' },
  minute: { type: '*', start: '0', end: '59', step: '1', list: '' },
  hour: { type: '*', start: '0', end: '23', step: '1', list: '' },
  day: { type: '*', start: '1', end: '31', step: '1', list: '' },
  month: { type: '*', start: '1', end: '12', step: '1', list: '' },
  week: { type: '*', start: '0', end: '6', step: '1', list: '', num: '1', day: '1' },
  year: { type: '*', start: '2024', end: '2030', step: '1', list: '' },
});

const buildCron = () => {
  const parts = [
    getPart(cron.second),
    getPart(cron.minute),
    getPart(cron.hour),
    getPart(cron.day),
    getPart(cron.month),
    getPart(cron.week),
    getPart(cron.year),
  ];
  cronExpression.value = parts.join(' ');
  ElMessage.success('Cron 表达式已生成');
};

const getPart = (part: any): string => {
  if (part.type === '*') return '*';
  if (part.type === '-') return `${part.start}-${part.end}`;
  if (part.type === '/') return `${part.start}/${part.step}`;
  if (part.type === ',') return part.list || '*';
  if (part.type === 'L') return 'L';
  if (part.type === 'W') return 'W';
  if (part.type === '#') return `${part.day}#${part.num}`;
  return '*';
};

const parseCron = () => {
  const parts = cronExpression.value.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 7) {
    cronError.value = 'Cron 表达式格式不正确';
    return;
  }
  cronError.value = '';
  ElMessage.success('解析完成');
};

const clearCron = () => {
  cronExpression.value = '* * * * *';
  cronError.value = '';
  nextRuns.value = [];
};

const setExample = (expr: string) => {
  cronExpression.value = expr;
  ElMessage.success('已设置');
};

const generateRandom = () => {
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  cronExpression.value = `${random(0, 59)} ${random(0, 23)} ${random(1, 31)} ${random(1, 12)} ${random(0, 6)}`;
  ElMessage.success('已生成随机 Cron');
};

const calculateNextRuns = () => {
  const now = new Date();
  const runs: string[] = [];
  let count = 0;
  let nextTime = new Date(now);

  // 简单模拟：基于表达式的下一次执行时间
  // 实际应该使用 cron-parser 库
  for (let i = 0; i < 5; i++) {
    nextTime.setMinutes(nextTime.getMinutes() + 1);
    while (count < 1000) {
      nextTime.setMinutes(nextTime.getMinutes() + 1);
      const timeStr = nextTime.toLocaleString('zh-CN');
      runs.push(timeStr);
      count++;
      break;
    }
    break;
  }

  // 简化的下次执行时间计算
  const parts = cronExpression.value.split(/\s+/);
  const sec = parseInt(parts[0]) || 0;
  const min = parseInt(parts[1]) || 0;
  const hour = parseInt(parts[2]) || 0;
  const day = parseInt(parts[3]) || 1;
  const month = parseInt(parts[4]) || 1;
  const week = parts[5];

  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setSeconds(sec);
    if (parts[1] === '*') d.setMinutes(d.getMinutes() + 1);
    else d.setMinutes(min);
    if (parts[2] === '*') d.setHours(d.getHours());
    else d.setHours(hour);
    if (parts[3] === '*') d.setDate(d.getDate() + i);
    else d.setDate(day);
    if (parts[4] === '*') d.setMonth(d.getMonth());
    else d.setMonth(month - 1);

    if (d > now) {
      runs.push(d.toLocaleString('zh-CN'));
      if (runs.length >= 5) break;
    }
  }

  nextRuns.value = runs;
  ElMessage.success('计算完成');
};
</script>

<style lang="scss" scoped>
.cron-tool {
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .区间输入, .步长输入, .列表输入, .周数字输入 {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .周说明 {
    font-size: 12px;
    color: #909399;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mt-2 {
    margin-top: 8px;
  }
}
</style>
