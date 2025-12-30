<template>
  <div class="resume-share">
    <div class="share-header">
      <h1>在线简历</h1>
      <div class="share-actions">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          下载 PDF
        </el-button>
      </div>
    </div>

    <div class="share-content">
      <div v-if="loading" class="loading-wrap">
        <el-icon class="loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="!resumeData.basic" class="empty-wrap">
        <el-icon size="64"><Warning /></el-icon>
        <p>简历不存在或已被删除</p>
      </div>

      <ResumePreview v-else :data="resumeData" :template="template" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Download, Loading, Warning } from '@element-plus/icons-vue';
import ResumePreview from './components/ResumePreview.vue';
import { getResumeShare } from '/@/api/resume';

const route = useRoute();
const loading = ref(true);
const template = ref('simple');
const resumeData = ref<any>({
  basic: null,
  education: [],
  work: [],
  project: [],
  skills: [],
  otherSkills: '',
  awards: '',
  evaluation: '',
});

const loadShareResume = async () => {
  const resumeId = route.params.id as string;
  loading.value = true;
  try {
    const res = await getResumeShare(resumeId);
    if (res.data) {
      resumeData.value = res.data;
      template.value = res.data.template || 'simple';
    }
  } catch (e) {
    console.error('加载简历失败', e);
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  ElMessage.success('导出功能开发中');
};

onMounted(() => {
  loadShareResume();
});
</script>

<style scoped lang="scss">
.resume-share {
  min-height: 100vh;
  background: #f5f7fa;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;

  h1 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
}

.share-content {
  padding: 24px;
  display: flex;
  justify-content: center;

  .loading-wrap,
  .empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: #909399;

    .loading {
      font-size: 48px;
      animation: rotate 1.5s linear infinite;
    }

    p {
      margin-top: 16px;
      font-size: 16px;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
