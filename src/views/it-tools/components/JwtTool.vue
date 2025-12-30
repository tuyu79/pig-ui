<template>
  <div class="jwt-tool">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card header="JWT 解析">
          <el-input
            v-model="jwtToken"
            type="textarea"
            :rows="4"
            placeholder="请输入 JWT Token (eyJ...)"
          />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="parseJwt">解析 Token</el-button>
            <el-button @click="decodeJwt">仅解码</el-button>
            <el-button @click="verifyJwt">验证签名</el-button>
            <el-button @click="clearJwt">清空</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="8">
        <el-card header="Header (头部)">
          <el-input
            v-model="headerJson"
            type="textarea"
            :rows="8"
            readonly
            placeholder="解析后显示"
          />
          <el-button type="primary" class="mt-2" @click="copyText(headerJson)" size="small">复制</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="Payload (负载)">
          <el-input
            v-model="payloadJson"
            type="textarea"
            :rows="8"
            readonly
            placeholder="解析后显示"
          />
          <el-button type="primary" class="mt-2" @click="copyText(payloadJson)" size="small">复制</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="Signature (签名)">
          <el-input
            v-model="signature"
            type="textarea"
            :rows="8"
            readonly
            placeholder="签名部分"
          />
          <el-button type="primary" class="mt-2" @click="copyText(signature)" size="small">复制</el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="JWT 生成" class="mt-4">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Header" name="header">
          <el-input
            v-model="customHeader"
            type="textarea"
            :rows="5"
            placeholder='{"alg": "HS256", "typ": "JWT"}'
          />
        </el-tab-pane>
        <el-tab-pane label="Payload" name="payload">
          <el-input
            v-model="customPayload"
            type="textarea"
            :rows="5"
            placeholder='{"sub": "1234567890", "name": "John Doe"}'
          />
        </el-tab-pane>
        <el-tab-pane label="密钥" name="secret">
          <el-input
            v-model="jwtSecret"
            placeholder="请输入签名密钥"
            show-password
          />
        </el-tab-pane>
      </el-tabs>
      <div class="操作区 mt-4">
        <el-button type="primary" @click="generateJwt">生成 JWT</el-button>
      </div>
      <el-input
        v-model="generatedJwt"
        type="textarea"
        :rows="3"
        readonly
        class="mt-4"
        placeholder="生成的 JWT"
      />
      <el-button type="primary" class="mt-2" @click="copyText(generatedJwt)">复制</el-button>
    </el-card>

    <el-alert
      v-if="jwtError"
      :title="jwtError"
      type="error"
      show-icon
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const jwtToken = ref('');
const headerJson = ref('');
const payloadJson = ref('');
const signature = ref('');
const jwtError = ref('');

const activeTab = ref('header');
const customHeader = ref('{"alg": "HS256", "typ": "JWT"}');
const customPayload = ref('{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}');
const jwtSecret = ref('');
const generatedJwt = ref('');

const base64UrlEncode = (str: string): string => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlDecode = (str: string): string => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
};

const parseJwt = () => {
  if (!jwtToken.value.trim()) {
    jwtError.value = '请输入 JWT Token';
    return;
  }

  const parts = jwtToken.value.trim().split('.');
  if (parts.length !== 3) {
    jwtError.value = 'JWT 格式不正确，应包含 3 个部分';
    return;
  }

  try {
    headerJson.value = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    payloadJson.value = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
    signature.value = parts[2];
    jwtError.value = '';
    ElMessage.success('解析成功');
  } catch (e: any) {
    jwtError.value = `解析错误: ${e.message}`;
  }
};

const decodeJwt = () => {
  if (!jwtToken.value.trim()) {
    jwtError.value = '请输入 JWT Token';
    return;
  }

  const parts = jwtToken.value.trim().split('.');
  if (parts.length !== 3) {
    jwtError.value = 'JWT 格式不正确';
    return;
  }

  try {
    headerJson.value = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    payloadJson.value = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
    signature.value = parts[2];
    jwtError.value = '';
    ElMessage.success('解码成功（未验证签名）');
  } catch (e: any) {
    jwtError.value = `解码错误: ${e.message}`;
  }
};

const verifyJwt = () => {
  parseJwt();
  if (!jwtError.value && !jwtSecret.value) {
    jwtError.value = '请输入密钥以验证签名';
  }
  // 客户端无法真正验证 HMAC 签名，这里只做提示
  if (!jwtError.value && jwtSecret.value) {
    ElMessage.warning('签名验证需要在服务端进行，此处仅解析');
  }
};

const clearJwt = () => {
  jwtToken.value = '';
  headerJson.value = '';
  payloadJson.value = '';
  signature.value = '';
  jwtError.value = '';
};

const generateJwt = () => {
  try {
    const header = JSON.parse(customHeader.value);
    const payload = JSON.parse(customPayload.value);
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    // 注意：真正的签名需要在服务端生成
    generatedJwt.value = `${encodedHeader}.${encodedPayload}.<signature>`;
    ElMessage.success('JWT 已生成（签名部分需要服务端生成）');
  } catch (e: any) {
    jwtError.value = `JSON 格式错误: ${e.message}`;
  }
};

const copyText = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};
</script>

<style lang="scss" scoped>
.jwt-tool {
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mt-2 {
    margin-top: 10px;
  }
}
</style>
