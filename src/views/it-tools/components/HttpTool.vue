<template>
  <div class="http-tool">
    <el-tabs v-model="activeTab" class="http-tabs">
      <el-tab-pane label="我的 IP" name="ip">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="IP 信息">
              <div class="ip-info">
                <div class="ip-row">
                  <span class="label">公网 IP：</span>
                  <span class="value ip-value">{{ ipInfo.ip }}</span>
                  <el-button text type="primary" @click="copyText(ipInfo.ip)">复制</el-button>
                </div>
                <div class="ip-row">
                  <span class="label">运营商：</span>
                  <span class="value">{{ ipInfo.isp }}</span>
                </div>
                <div class="ip-row">
                  <span class="label">位置：</span>
                  <span class="value">{{ ipInfo.location }}</span>
                </div>
                <div class="ip-row">
                  <span class="label">经纬度：</span>
                  <span class="value">{{ ipInfo.coordinates }}</span>
                </div>
                <div class="ip-row">
                  <span class="label">时区：</span>
                  <span class="value">{{ ipInfo.timezone }}</span>
                </div>
                <div class="ip-row">
                  <span class="label">浏览器UA：</span>
                  <span class="value ua-text">{{ userAgent }}</span>
                </div>
              </div>
              <el-button type="primary" @click="getIpInfo" class="mt-4" :loading="loadingIp">
                刷新 IP 信息
              </el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="IP 查询">
              <el-input v-model="queryIp" placeholder="请输入 IP 地址">
                <template #append>
                  <el-button @click="queryIpInfo">查询</el-button>
                </template>
              </el-input>
              <div v-if="queryResult" class="查询结果 mt-4">
                <el-input type="textarea" :rows="8" :value="queryResult" readonly />
              </div>
            </el-card>

            <el-card header="本地信息" class="mt-4">
              <el-descriptions :column="1" size="small">
                <el-descriptions-item label="操作系统">
                  {{ osInfo }}
                </el-descriptions-item>
                <el-descriptions-item label="浏览器">
                  {{ browserInfo }}
                </el-descriptions-item>
                <el-descriptions-item label="语言">
                  {{ language }}
                </el-descriptions-item>
                <el-descriptions-item label="屏幕分辨率">
                  {{ screenResolution }}
                </el-descriptions-item>
                <el-descriptions-item label="在线状态">
                  <el-tag :type="onlineStatus ? 'success' : 'danger'">
                    {{ onlineStatus ? '在线' : '离线' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="HTTP 请求解析" name="parse">
        <el-card header="请求解析">
          <el-input
            v-model="rawRequest"
            type="textarea"
            :rows="12"
            placeholder="输入 cURL 命令或 HTTP 请求，如：curl -X POST https://api.example.com/data -H Content-Type:application/json -d name=test"
          />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="parseCurl">解析 cURL</el-button>
            <el-button @click="parseHttp">解析 HTTP 请求</el-button>
            <el-button @click="clearRequest">清空</el-button>
          </div>
        </el-card>

        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <el-card header="解析结果">
              <el-form label-position="top">
                <el-form-item label="方法">
                  <el-select v-model="parsedMethod" style="width: 100%">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                    <el-option label="PATCH" value="PATCH" />
                    <el-option label="HEAD" value="HEAD" />
                    <el-option label="OPTIONS" value="OPTIONS" />
                  </el-select>
                </el-form-item>
                <el-form-item label="URL">
                  <el-input v-model="parsedUrl" placeholder="请求 URL" />
                </el-form-item>
                <el-form-item label="Headers">
                  <el-input
                    v-model="parsedHeaders"
                    type="textarea"
                    :rows="6"
                    placeholder="请求头（JSON 格式）"
                  />
                </el-form-item>
                <el-form-item label="Body">
                  <el-input
                    v-model="parsedBody"
                    type="textarea"
                    :rows="6"
                    placeholder="请求体（JSON 格式）"
                  />
                </el-form-item>
              </el-form>
              <div class="操作区">
                <el-button type="primary" @click="copyParsed">复制解析结果</el-button>
                <el-button @click="formatBody">格式化 Body</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="生成代码">
              <el-radio-group v-model="codeType" class="mb-4">
                <el-radio value="curl">cURL</el-radio>
                <el-radio value="fetch">Fetch</el-radio>
                <el-radio value="axios">Axios</el-radio>
                <el-radio value="httpie">HTTPie</el-radio>
              </el-radio-group>
              <el-input
                v-model="generatedCode"
                type="textarea"
                :rows="12"
                readonly
                placeholder="生成的代码"
              />
              <div class="操作区 mt-4">
                <el-button type="primary" @click="copyCode">复制代码</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('ip');
const loadingIp = ref(false);
const ipInfo = reactive({
  ip: '检测中...',
  isp: '-',
  location: '-',
  coordinates: '-',
  timezone: '-',
});

const queryIp = ref('');
const queryResult = ref('');
const rawRequest = ref('');
const parsedMethod = ref('GET');
const parsedUrl = ref('');
const parsedHeaders = ref('');
const parsedBody = ref('');
const codeType = ref('curl');
const generatedCode = ref('');

const userAgent = navigator.userAgent;
const osInfo = getOS();
const browserInfo = getBrowser();
const language = navigator.language;
const screenResolution = `${window.screen.width} x ${window.screen.height}`;
const onlineStatus = ref(navigator.onLine);

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'IE';
  return 'Unknown';
}

const getIpInfo = async () => {
  loadingIp.value = true;
  try {
    // 使用 ipify API 获取公网 IP
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    ipInfo.ip = ipData.ip;

    // 使用 ipapi.co 获取详细信息
    try {
      const detailRes = await fetch(`https://ipapi.co/json/${ipData.ip}`);
      const detailData = await detailRes.json();
      ipInfo.isp = detailData.org || '-';
      ipInfo.location = `${detailData.city || ''} ${detailData.region || ''} ${detailData.country_name || ''}`.trim();
      ipInfo.coordinates = `${detailData.latitude}, ${detailData.longitude}`;
      ipInfo.timezone = detailData.timezone || '-';
    } catch (e) {
      ipInfo.isp = '获取失败';
      ipInfo.location = '获取失败';
    }
  } catch (e: any) {
    ipInfo.ip = '获取失败';
    ElMessage.error('获取 IP 信息失败');
  }
  loadingIp.value = false;
};

const queryIpInfo = async () => {
  if (!queryIp.value) {
    ElMessage.warning('请输入 IP 地址');
    return;
  }
  try {
    const res = await fetch(`https://ipapi.co/json/${queryIp.value}`);
    const data = await res.json();
    queryResult.value = JSON.stringify(data, null, 2);
    ElMessage.success('查询完成');
  } catch (e) {
    ElMessage.error('查询失败');
  }
};

const parseCurl = () => {
  if (!rawRequest.value.trim()) {
    ElMessage.warning('请输入 cURL 命令');
    return;
  }

  try {
    // 简单的 cURL 解析
    let curl = rawRequest.value.trim();

    // 移除 curl 开头
    curl = curl.replace(/^curl\s+/i, '');

    // 提取方法
    const methodMatch = curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i);
    if (methodMatch) {
      parsedMethod.value = methodMatch[1].toUpperCase();
    } else {
      // 没有明确指定方法时，默认 GET（除非有 -d 或 --data）
      const hasData = curl.match(/(-d|--data|--data-raw|--data-binary)/);
      parsedMethod.value = hasData ? 'POST' : 'GET';
    }

    // 提取 URL
    const urlMatch = curl.match(/['"](https?:\/\/[^'"]+)['"]/) || curl.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      parsedUrl.value = urlMatch[1].split('?')[0]; // 移除查询参数
      const urlObj = new URL(urlMatch[1]);
      // 保留查询参数
      if (urlObj.search) {
        parsedUrl.value = urlMatch[1];
      }
    }

    // 提取 Headers
    const headers: Record<string, string> = {};
    const headerMatches = curl.matchAll(/-H\s+['"]([^'"]+)['"]/gi);
    for (const match of headerMatches) {
      const [key, value] = match[1].split(':', 2);
      if (key && value) {
        headers[key.trim()] = value.trim();
      }
    }
    parsedHeaders.value = JSON.stringify(headers, null, 2);

    // 提取 Body
    const bodyMatch = curl.match(/(-d|--data|--data-raw|--data-binary)\s+['"]([^'"]+)['"]/);
    if (bodyMatch) {
      let body = bodyMatch[2];
      try {
        // 尝试解析 JSON
        body = JSON.stringify(JSON.parse(body), null, 2);
      } catch (e) {
        // 不是 JSON，保持原样
      }
      parsedBody.value = body;
    }

    generateCode();
    ElMessage.success('cURL 解析成功');
  } catch (e: any) {
    ElMessage.error(`解析错误: ${e.message}`);
  }
};

const parseHttp = () => {
  if (!rawRequest.value.trim()) {
    ElMessage.warning('请输入 HTTP 请求');
    return;
  }

  try {
    const lines = rawRequest.value.trim().split('\n');
    const firstLine = lines[0].trim();

    // 解析请求行
    const requestParts = firstLine.split(' ');
    if (requestParts.length >= 2) {
      parsedMethod.value = requestParts[0].toUpperCase();
      parsedUrl.value = requestParts[1];
    }

    // 解析 Headers
    const headers: Record<string, string> = {};
    let bodyStartIndex = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        bodyStartIndex = i + 1;
        break;
      }
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        headers[key.trim()] = valueParts.join(':').trim();
      }
    }

    // 提取 Body
    if (bodyStartIndex < lines.length) {
      const body = lines.slice(bodyStartIndex).join('\n').trim();
      try {
        parsedBody.value = JSON.stringify(JSON.parse(body), null, 2);
      } catch (e) {
        parsedBody.value = body;
      }
    } else {
      parsedBody.value = '';
    }

    parsedHeaders.value = JSON.stringify(headers, null, 2);
    generateCode();
    ElMessage.success('HTTP 请求解析成功');
  } catch (e: any) {
    ElMessage.error(`解析错误: ${e.message}`);
  }
};

const generateCode = () => {
  try {
    const headers = parsedHeaders.value ? JSON.parse(parsedHeaders.value) : {};
    const body = parsedBody.value;

    if (codeType.value === 'curl') {
      let curl = `curl -X ${parsedMethod.value} '${parsedUrl.value}'`;
      for (const [key, value] of Object.entries(headers)) {
        curl += ` \\\n  -H '${key}: ${value}'`;
      }
      if (body && ['POST', 'PUT', 'PATCH'].includes(parsedMethod.value)) {
        curl += ` \\\n  -d '${body.replace(/\n/g, '')}'`;
      }
      generatedCode.value = curl;
    } else if (codeType.value === 'fetch') {
      const fetchCode = `fetch('${parsedUrl.value}', {
  method: '${parsedMethod.value}',
  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},
${body && ['POST', 'PUT', 'PATCH'].includes(parsedMethod.value) ? `  body: JSON.stringify(${body})
` : ''}}).then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
      generatedCode.value = fetchCode;
    } else if (codeType.value === 'axios') {
      const axiosCode = `import axios from 'axios';

axios({
  method: '${parsedMethod.value}',
  url: '${parsedUrl.value}',
  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')},
${body && ['POST', 'PUT', 'PATCH'].includes(parsedMethod.value) ? `  data: ${body}
` : ''}}).then(response => console.log(response.data))
.catch(error => console.error('Error:', error));`;
      generatedCode.value = axiosCode;
    } else if (codeType.value === 'httpie') {
      let httpie = `http ${parsedMethod.value.toLowerCase()} '${parsedUrl.value}'`;
      for (const [key, value] of Object.entries(headers)) {
        httpie += ` \\\n  '${key}: ${value}'`;
      }
      if (body && ['POST', 'PUT', 'PATCH'].includes(parsedMethod.value)) {
        httpie += ` \\\n  <<<'${body.replace(/\n/g, '')}'`;
      }
      generatedCode.value = httpie;
    }
  } catch (e: any) {
    ElMessage.error(`生成代码失败: ${e.message}`);
  }
};

const clearRequest = () => {
  rawRequest.value = '';
  parsedMethod.value = 'GET';
  parsedUrl.value = '';
  parsedHeaders.value = '';
  parsedBody.value = '';
  generatedCode.value = '';
};

const copyParsed = () => {
  const text = `方法: ${parsedMethod.value}\nURL: ${parsedUrl.value}\nHeaders: ${parsedHeaders.value}\nBody: ${parsedBody.value}`;
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value);
  ElMessage.success('已复制到剪贴板');
};

const formatBody = () => {
  if (!parsedBody.value) return;
  try {
    const parsed = JSON.parse(parsedBody.value);
    parsedBody.value = JSON.stringify(parsed, null, 2);
    ElMessage.success('格式化成功');
  } catch (e) {
    ElMessage.error('Body 不是有效的 JSON');
  }
};

const copyText = (text: string) => {
  if (!text || text === '检测中...' || text === '-') return;
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

// 监听在线状态变化
const handleOnline = () => { onlineStatus.value = true; };
const handleOffline = () => { onlineStatus.value = false; };

onMounted(() => {
  getIpInfo();
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style lang="scss" scoped>
.http-tool {
  .ip-info {
    .ip-row {
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;
      .label {
        color: #909399;
        width: 80px;
        flex-shrink: 0;
      }
      .value {
        flex: 1;
        word-break: break-all;
      }
      .ip-value {
        font-size: 18px;
        font-weight: bold;
        color: var(--el-color-primary);
      }
      .ua-text {
        font-size: 12px;
        color: #606266;
      }
    }
  }
  .查询结果 {
    font-family: monospace;
  }
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .http-tabs {
    :deep(.el-tabs__content) {
      padding: 20px 0;
    }
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
}
</style>
