<template>
  <div class="base64-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="编码 (Encode)">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="10"
            placeholder="请输入要编码的文本"
          />
          <div class="操作区">
            <el-button type="primary" @click="encodeBase64">编码</el-button>
            <el-button @click="clearText">清空</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="解码 (Decode)">
          <el-input
            v-model="decodeText"
            type="textarea"
            :rows="10"
            placeholder="请输入要解码的 Base64 字符串"
          />
          <div class="操作区">
            <el-button type="primary" @click="decodeBase64">解码</el-button>
            <el-button @click="copyDecode">复制结果</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="文件转 Base64" class="mt-4">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept="image/*,.pdf,.txt"
        @change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div v-if="fileBase64" class="文件预览 mt-4">
        <el-input
          v-model="fileBase64"
          type="textarea"
          :rows="4"
          readonly
          placeholder="Base64 结果"
        />
        <el-button type="primary" class="mt-2" @click="copyText(fileBase64)">复制</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';

const inputText = ref('');
const decodeText = ref('');
const fileBase64 = ref('');

const encodeBase64 = () => {
  if (!inputText.value) return;
  try {
    const encoded = btoa(unescape(encodeURIComponent(inputText.value)));
    decodeText.value = encoded;
    ElMessage.success('编码成功');
  } catch (e) {
    ElMessage.error('编码失败');
  }
};

const decodeBase64 = () => {
  if (!decodeText.value) return;
  try {
    const decoded = decodeURIComponent(escape(atob(decodeText.value)));
    inputText.value = decoded;
    ElMessage.success('解码成功');
  } catch (e) {
    ElMessage.error('解码失败，请检查输入是否有效');
  }
};

const clearText = () => {
  inputText.value = '';
  decodeText.value = '';
};

const copyDecode = () => {
  if (!decodeText.value) return;
  navigator.clipboard.writeText(decodeText.value);
  ElMessage.success('已复制到剪贴板');
};

const handleFileChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    fileBase64.value = e.target?.result as string;
    ElMessage.success('文件转 Base64 成功');
  };
  reader.readAsDataURL(file.raw);
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};
</script>

<style lang="scss" scoped>
.base64-tool {
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
}
</style>
