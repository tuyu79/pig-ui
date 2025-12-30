<template>
  <div class="url-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="编码 (Encode)">
          <el-input
            v-model="inputUrl"
            type="textarea"
            :rows="10"
            placeholder="请输入要编码的 URL"
          />
          <div class="操作区">
            <el-button type="primary" @click="encodeUrl">编码</el-button>
            <el-button @click="encodeUrlComponent">编码组件</el-button>
            <el-button @click="clearUrl">清空</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="解码 (Decode)">
          <el-input
            v-model="decodeUrl"
            type="textarea"
            :rows="10"
            placeholder="请输入要解码的 URL 编码字符串"
          />
          <div class="操作区">
            <el-button type="primary" @click="decodeUrlText">解码</el-button>
            <el-button @click="copyUrl">复制结果</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="常用工具" class="mt-4">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="URL 解码">
          <el-input
            v-model="quickDecode"
            placeholder="粘贴 URL 编码字符串"
            @input="quickDecodeResult = decodeURIComponent(quickDecode)"
          />
          <div class="快速结果 mt-2">{{ quickDecodeResult }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="URL 编码">
          <el-input
            v-model="quickEncode"
            placeholder="输入普通字符串"
            @input="quickEncodeResult = encodeURIComponent(quickEncode)"
          />
          <div class="快速结果 mt-2">{{ quickEncodeResult }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="十六进制解码">
          <el-input
            v-model="hexInput"
            placeholder="输入十六进制字符串"
          />
          <el-button type="primary" size="small" class="mt-2" @click="decodeHex">解码</el-button>
          <div class="快速结果 mt-2">{{ hexResult }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const inputUrl = ref('');
const decodeUrl = ref('');

const quickDecode = ref('');
const quickDecodeResult = ref('');
const quickEncode = ref('');
const quickEncodeResult = ref('');

const hexInput = ref('');
const hexResult = ref('');

const encodeUrl = () => {
  if (!inputUrl.value) return;
  decodeUrl.value = encodeURI(inputUrl.value);
  ElMessage.success('编码成功');
};

const encodeUrlComponent = () => {
  if (!inputUrl.value) return;
  decodeUrl.value = encodeURIComponent(inputUrl.value);
  ElMessage.success('编码成功');
};

const decodeUrlText = () => {
  if (!decodeUrl.value) return;
  try {
    inputUrl.value = decodeURI(decodeUrl.value);
    ElMessage.success('解码成功');
  } catch (e) {
    ElMessage.error('解码失败');
  }
};

const clearUrl = () => {
  inputUrl.value = '';
  decodeUrl.value = '';
};

const copyUrl = () => {
  if (!decodeUrl.value) return;
  navigator.clipboard.writeText(decodeUrl.value);
  ElMessage.success('已复制到剪贴板');
};

const decodeHex = () => {
  if (!hexInput.value) return;
  try {
    const hex = hexInput.value.replace(/\s/g, '');
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    hexResult.value = result;
    ElMessage.success('解码成功');
  } catch (e) {
    ElMessage.error('十六进制格式不正确');
  }
};
</script>

<style lang="scss" scoped>
.url-tool {
  .操作区 {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mt-2 {
    margin-top: 10px;
  }
  .快速结果 {
    padding: 10px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    word-break: break-all;
    font-family: monospace;
    min-height: 20px;
  }
}
</style>
