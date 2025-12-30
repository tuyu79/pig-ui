<template>
  <div class="json-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="输入">
          <el-input
            v-model="inputJson"
            type="textarea"
            :rows="12"
            placeholder="请输入 JSON 字符串"
          />
          <div class="操作区">
            <el-button type="primary" @click="formatJson">格式化</el-button>
            <el-button @click="minifyJson">压缩</el-button>
            <el-button @click="escapeJson">转义</el-button>
            <el-button @click="unescapeJson">去转义</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="输出">
          <el-input
            v-model="outputJson"
            type="textarea"
            :rows="12"
            readonly
            placeholder="处理后的结果"
          />
          <div class="操作区">
            <el-button type="primary" @click="copyJson">复制</el-button>
            <el-button @click="exportJson">下载</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-alert
      v-if="jsonError"
      :title="jsonError"
      type="error"
      show-icon
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const inputJson = ref('');
const outputJson = ref('');
const jsonError = ref('');

const formatJson = () => {
  if (!inputJson.value.trim()) {
    jsonError.value = '请输入 JSON 字符串';
    return;
  }
  try {
    const parsed = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(parsed, null, 2);
    jsonError.value = '';
    ElMessage.success('格式化成功');
  } catch (e: any) {
    jsonError.value = `JSON 解析错误: ${e.message}`;
    outputJson.value = '';
  }
};

const minifyJson = () => {
  if (!inputJson.value.trim()) {
    jsonError.value = '请输入 JSON 字符串';
    return;
  }
  try {
    const parsed = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(parsed);
    jsonError.value = '';
    ElMessage.success('压缩成功');
  } catch (e: any) {
    jsonError.value = `JSON 解析错误: ${e.message}`;
    outputJson.value = '';
  }
};

const escapeJson = () => {
  if (!inputJson.value.trim()) {
    jsonError.value = '请输入 JSON 字符串';
    return;
  }
  try {
    const parsed = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(parsed);
    jsonError.value = '';
    ElMessage.success('转义成功');
  } catch (e: any) {
    // 即使解析失败，也对原始字符串进行转义
    outputJson.value = inputJson.value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    jsonError.value = '';
    ElMessage.success('转义成功');
  }
};

const unescapeJson = () => {
  if (!inputJson.value.trim()) {
    jsonError.value = '请输入内容';
    return;
  }
  try {
    outputJson.value = JSON.parse(inputJson.value);
    jsonError.value = '';
    ElMessage.success('去转义成功');
  } catch (e: any) {
    // 手动去除转义字符
    let result = inputJson.value;
    const escapeMap: Record<string, string> = {
      '\\\\': '\x00BACKSLASH\x00',
      '\\n': '\n',
      '\\r': '\r',
      '\\t': '\t',
      '\\"': '"',
      "\\'": "'",
      '\\/': '/',
      '\\b': '\b',
      '\\f': '\f',
    };
    // 先处理双反斜杠
    result = result.replace(/\\\\/g, escapeMap['\\\\']);
    // 处理其他转义
    for (const [key, val] of Object.entries(escapeMap)) {
      if (key !== '\\\\') {
        result = result.replace(new RegExp(key, 'g'), val);
      }
    }
    // 恢复反斜杠
    result = result.replace(/\x00BACKSLASH\x00/g, '\\');
    outputJson.value = result;
    jsonError.value = '';
    ElMessage.success('去转义成功');
  }
};

const clearJson = () => {
  inputJson.value = '';
  outputJson.value = '';
  jsonError.value = '';
};

const copyJson = () => {
  if (!outputJson.value) return;
  navigator.clipboard.writeText(outputJson.value);
  ElMessage.success('已复制到剪贴板');
};

const exportJson = () => {
  if (!outputJson.value) return;
  const blob = new Blob([outputJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('下载成功');
};
</script>

<style lang="scss" scoped>
.json-tool {
  .操作区 {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}
.mt-4 {
  margin-top: 16px;
}
</style>
