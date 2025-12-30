<template>
  <div class="it-tools-container">
    <el-tabs v-model="activeTab" class="it-tools-tabs">
      <!-- JSON -->
      <el-tab-pane label="JSON" name="json">
        <JsonTool />
      </el-tab-pane>

      <!-- URL -->
      <el-tab-pane label="URL" name="url">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="URL 解析">
              <el-input
                v-model="urlInput"
                type="textarea"
                :rows="8"
                placeholder="请输入 URL，如：https://example.com/path?a=1&b=2"
              />
              <div class="操作区 mt-4">
                <el-button type="primary" @click="parseUrl">解析 URL</el-button>
                <el-button @click="copyUrlParts">复制参数</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="解析结果">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="协议">{{ urlResult.protocol }}</el-descriptions-item>
                <el-descriptions-item label="主机">{{ urlResult.host }}</el-descriptions-item>
                <el-descriptions-item label="路径">{{ urlResult.path }}</el-descriptions-item>
                <el-descriptions-item label="查询参数">
                  <pre>{{ urlResult.query }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <el-card header="URL 编码">
              <el-input v-model="urlEncodeInput" type="textarea" :rows="4" placeholder="输入要编码的 URL" />
              <div class="操作区 mt-4">
                <el-button type="primary" @click="encodeUrl">编码</el-button>
                <el-button @click="encodeUrlComponent">编码组件</el-button>
              </div>
              <el-input v-model="urlEncodeOutput" type="textarea" :rows="4" readonly class="mt-4" placeholder="结果" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="URL 解码">
              <el-input v-model="urlDecodeInput" type="textarea" :rows="4" placeholder="输入要解码的 URL 编码" />
              <div class="操作区 mt-4">
                <el-button type="primary" @click="decodeUrl">解码</el-button>
              </div>
              <el-input v-model="urlDecodeOutput" type="textarea" :rows="4" readonly class="mt-4" placeholder="结果" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- Base64 -->
      <el-tab-pane label="Base64" name="base64">
        <Base64Tool />
      </el-tab-pane>

      <!-- JWT -->
      <el-tab-pane label="JWT" name="jwt">
        <JwtTool />
      </el-tab-pane>

      <!-- 文本处理 -->
      <el-tab-pane label="文本处理" name="text">
        <TextTool />
      </el-tab-pane>

      <!-- 时间 -->
      <el-tab-pane label="时间" name="time">
        <el-tabs v-model="timeSubTab">
          <el-tab-pane label="时间戳" name="timestamp">
            <TimestampTool />
          </el-tab-pane>
          <el-tab-pane label="Cron 表达式" name="cron">
            <CronTool />
          </el-tab-pane>
          <el-tab-pane label="世界时间" name="worldtime">
            <WorldTimeTool />
          </el-tab-pane>
          <el-tab-pane label="日期计算" name="datecalc">
            <el-card header="日期计算">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-date-picker
                    v-model="dateCalcStart"
                    type="date"
                    placeholder="开始日期"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="8">
                  <el-date-picker
                    v-model="dateCalcEnd"
                    type="date"
                    placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="8">
                  <el-button type="primary" @click="calculateDateDiff">计算差值</el-button>
                </el-col>
              </el-row>
              <div v-if="dateDiffResult" class="结果 mt-4">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="天数差">{{ dateDiffResult.days }} 天</el-descriptions-item>
                  <el-descriptions-item label="小时差">{{ dateDiffResult.hours }} 小时</el-descriptions-item>
                  <el-descriptions-item label="分钟差">{{ dateDiffResult.minutes }} 分钟</el-descriptions-item>
                </el-descriptions>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- HTTP -->
      <el-tab-pane label="HTTP" name="http">
        <HttpTool />
      </el-tab-pane>

      <!-- 颜色 -->
      <el-tab-pane label="颜色" name="color">
        <el-tabs v-model="colorSubTab">
          <el-tab-pane label="颜色转换" name="convert">
            <ColorTool />
          </el-tab-pane>
          <el-tab-pane label="颜色拾取" name="picker">
            <ColorPickerTool />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 二维码 -->
      <el-tab-pane label="二维码" name="qrcode">
        <QrCodeTool />
      </el-tab-pane>

      <!-- SSL 证书 -->
      <el-tab-pane label="SSL 证书" name="cert">
        <CertTool />
      </el-tab-pane>

      <!-- 加密算法 -->
      <el-tab-pane label="加密算法" name="crypto">
        <CryptoTool />
      </el-tab-pane>

      <!-- 随机生成 -->
      <el-tab-pane label="随机生成" name="random">
        <el-tabs v-model="randomSubTab">
          <el-tab-pane label="密码生成" name="password">
            <PasswordTool />
          </el-tab-pane>
          <el-tab-pane label="UUID" name="uuid">
            <UuidTool />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import JsonTool from './components/JsonTool.vue';
import Base64Tool from './components/Base64Tool.vue';
import JwtTool from './components/JwtTool.vue';
import TextTool from './components/TextTool.vue';
import TimestampTool from './components/TimestampTool.vue';
import CronTool from './components/CronTool.vue';
import WorldTimeTool from './components/WorldTimeTool.vue';
import HttpTool from './components/HttpTool.vue';
import ColorTool from './components/ColorTool.vue';
import ColorPickerTool from './components/ColorPickerTool.vue';
import QrCodeTool from './components/QrCodeTool.vue';
import CertTool from './components/CertTool.vue';
import CryptoTool from './components/CryptoTool.vue';
import PasswordTool from './components/PasswordTool.vue';
import UuidTool from './components/UuidTool.vue';

const activeTab = ref('json');
const timeSubTab = ref('timestamp');
const colorSubTab = ref('convert');
const randomSubTab = ref('password');

// URL 解析
const urlInput = ref('');
const urlResult = reactive({
  protocol: '',
  host: '',
  path: '',
  query: '',
});

const parseUrl = () => {
  if (!urlInput.value) {
    ElMessage.warning('请输入 URL');
    return;
  }
  try {
    const url = new URL(urlInput.value);
    urlResult.protocol = url.protocol;
    urlResult.host = url.host;
    urlResult.path = url.pathname;
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => params[k] = v);
    urlResult.query = JSON.stringify(params, null, 2);
    ElMessage.success('解析成功');
  } catch (e) {
    ElMessage.error('URL 格式不正确');
  }
};

const copyUrlParts = () => {
  const text = `协议: ${urlResult.protocol}\n主机: ${urlResult.host}\n路径: ${urlResult.path}\n参数:\n${urlResult.query}`;
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制');
};

// URL 编解码
const urlEncodeInput = ref('');
const urlEncodeOutput = ref('');
const urlDecodeInput = ref('');
const urlDecodeOutput = ref('');

const encodeUrl = () => {
  urlEncodeOutput.value = encodeURI(urlEncodeInput.value);
  ElMessage.success('编码成功');
};

const encodeUrlComponent = () => {
  urlEncodeOutput.value = encodeURIComponent(urlEncodeInput.value);
  ElMessage.success('编码成功');
};

const decodeUrl = () => {
  try {
    urlDecodeOutput.value = decodeURI(urlDecodeInput.value);
    ElMessage.success('解码成功');
  } catch (e) {
    ElMessage.error('解码失败');
  }
};

// 日期计算
const dateCalcStart = ref('');
const dateCalcEnd = ref('');
const dateDiffResult = ref<{ days: number; hours: number; minutes: number } | null>(null);

const calculateDateDiff = () => {
  if (!dateCalcStart.value || !dateCalcEnd.value) {
    ElMessage.warning('请选择开始和结束日期');
    return;
  }
  const start = new Date(dateCalcStart.value as string).getTime();
  const end = new Date(dateCalcEnd.value as string).getTime();
  const diff = Math.abs(end - start);

  dateDiffResult.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor(diff / (1000 * 60)),
  };
  ElMessage.success('计算完成');
};
</script>

<style lang="scss" scoped>
.it-tools-container {
  padding: 20px;
  background-color: var(--el-bg-color);
  min-height: calc(100vh - 100px);
}

.it-tools-tabs {
  :deep(.el-tabs__content) {
    padding: 20px 0;
  }
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
}

.操作区 {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.mt-4 {
  margin-top: 16px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
}
</style>
