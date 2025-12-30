<template>
  <div class="resume-builder">
    <!-- 顶部工具栏 -->
    <div class="builder-header">
      <div class="header-left">
        <h2>我的简历</h2>
        <el-tag v-if="resumeData.basic" type="success" size="small" class="save-status">
          {{ autoSaveText }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="primary" @click="handlePreview">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出 PDF
          </el-button>
          <el-button type="success" @click="handleShare">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="builder-content">
      <!-- 左侧编辑区 -->
      <div class="edit-panel">
        <el-tabs v-model="activeTab" class="edit-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form :model="resumeData.basic" label-width="80px">
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                >
                  <img v-if="resumeData.basic.avatar" :src="resumeData.basic.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="姓名">
                <el-input v-model="resumeData.basic.name" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="resumeData.basic.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="年龄">
                <el-input-number v-model="resumeData.basic.age" :min="18" :max="60" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="resumeData.basic.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="resumeData.basic.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="所在城市">
                <el-input v-model="resumeData.basic.city" placeholder="如：北京市" />
              </el-form-item>
              <el-form-item label="求职意向">
                <el-input v-model="resumeData.basic.intention" placeholder="如：前端开发工程师" />
              </el-form-item>
              <el-form-item label="期望薪资">
                <el-input v-model="resumeData.basic.salary" placeholder="如：15k-20k" />
              </el-form-item>
              <el-form-item label="个人优势">
                <el-input v-model="resumeData.basic.summary" type="textarea" :rows="4" placeholder="用一句话概括你的优势和特点" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 教育经历 -->
          <el-tab-pane label="教育经历" name="education">
            <div v-for="(edu, index) in resumeData.education" :key="index" class="item-card">
              <div class="item-header">
                <span>教育经历 {{ index + 1 }}</span>
                <el-button type="danger" link @click="removeEducation(index)">删除</el-button>
              </div>
              <el-form label-width="80px" size="small">
                <el-form-item label="学校">
                  <el-input v-model="edu.school" placeholder="学校名称" />
                </el-form-item>
                <el-form-item label="学历">
                  <el-select v-model="edu.degree" placeholder="请选择">
                    <el-option label="博士" value="博士" />
                    <el-option label="硕士" value="硕士" />
                    <el-option label="本科" value="本科" />
                    <el-option label="大专" value="大专" />
                  </el-select>
                </el-form-item>
                <el-form-item label="专业">
                  <el-input v-model="edu.major" placeholder="专业" />
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="edu.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="入学时间"
                    end-placeholder="毕业时间"
                    value-format="YYYY-MM"
                  />
                </el-form-item>
              </el-form>
            </div>
            <el-button type="primary" plain @click="addEducation" class="add-btn">
              <el-icon><Plus /></el-icon> 添加教育经历
            </el-button>
          </el-tab-pane>

          <!-- 工作经历 -->
          <el-tab-pane label="工作经历" name="work">
            <div v-for="(work, index) in resumeData.work" :key="index" class="item-card">
              <div class="item-header">
                <span>工作经历 {{ index + 1 }}</span>
                <el-button type="danger" link @click="removeWork(index)">删除</el-button>
              </div>
              <el-form label-width="80px" size="small">
                <el-form-item label="公司">
                  <el-input v-model="work.company" placeholder="公司名称" />
                </el-form-item>
                <el-form-item label="职位">
                  <el-input v-model="work.position" placeholder="职位名称" />
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="work.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="YYYY-MM"
                  />
                </el-form-item>
                <el-form-item label="工作内容">
                  <el-input v-model="work.description" type="textarea" :rows="4" placeholder="描述工作内容和成就" />
                </el-form-item>
              </el-form>
            </div>
            <el-button type="primary" plain @click="addWork" class="add-btn">
              <el-icon><Plus /></el-icon> 添加工作经历
            </el-button>
          </el-tab-pane>

          <!-- 项目经历 -->
          <el-tab-pane label="项目经历" name="project">
            <div v-for="(proj, index) in resumeData.project" :key="index" class="item-card">
              <div class="item-header">
                <span>项目经历 {{ index + 1 }}</span>
                <el-button type="danger" link @click="removeProject(index)">删除</el-button>
              </div>
              <el-form label-width="80px" size="small">
                <el-form-item label="项目名称">
                  <el-input v-model="proj.name" placeholder="项目名称" />
                </el-form-item>
                <el-form-item label="担任角色">
                  <el-input v-model="proj.role" placeholder="担任角色" />
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="proj.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="YYYY-MM"
                  />
                </el-form-item>
                <el-form-item label="技术栈">
                  <el-input v-model="proj.tech" placeholder="使用的技术，用逗号分隔" />
                </el-form-item>
                <el-form-item label="项目描述">
                  <el-input v-model="proj.description" type="textarea" :rows="3" placeholder="项目介绍" />
                </el-form-item>
                <el-form-item label="我的职责">
                  <el-input v-model="proj.achievement" type="textarea" :rows="3" placeholder="描述你的职责和成果" />
                </el-form-item>
              </el-form>
            </div>
            <el-button type="primary" plain @click="addProject" class="add-btn">
              <el-icon><Plus /></el-icon> 添加项目经历
            </el-button>
          </el-tab-pane>

          <!-- 技能特长 -->
          <el-tab-pane label="技能特长" name="skill">
            <el-form label-width="80px">
              <el-form-item label="专业技能">
                <el-select
                  v-model="resumeData.skills"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="输入技能后按回车"
                  style="width: 100%"
                >
                  <el-option v-for="skill in allSkills" :key="skill" :label="skill" :value="skill" />
                </el-select>
              </el-form-item>
              <el-form-item label="其他技能">
                <el-input v-model="resumeData.otherSkills" type="textarea" :rows="3" placeholder="兴趣爱好、语言能力等" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 荣誉奖项 -->
          <el-tab-pane label="荣誉奖项" name="award">
            <el-input
              v-model="resumeData.awards"
              type="textarea"
              :rows="6"
              placeholder="请输入荣誉奖项，每行一个&#10;如：&#10;校级优秀毕业生&#10;全国编程大赛一等奖"
            />
          </el-tab-pane>

          <!-- 自我评价 -->
          <el-tab-pane label="自我评价" name="evaluation">
            <el-input
              v-model="resumeData.evaluation"
              type="textarea"
              :rows="6"
              placeholder="请输入自我评价"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧预览区 -->
      <div class="preview-panel">
        <div class="preview-header">
          <span>简历预览</span>
          <el-select v-model="currentTemplate" placeholder="选择模板" style="width: 120px" size="small">
            <el-option label="简约模板" value="simple" />
            <el-option label="专业模板" value="professional" />
            <el-option label="创意模板" value="creative" />
          </el-select>
        </div>
        <div class="preview-content">
          <ResumePreview :data="resumeData" :template="currentTemplate" />
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="简历预览" width="800px" fullscreen>
      <ResumePreview :data="resumeData" :template="currentTemplate" />
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExport">导出 PDF</el-button>
      </template>
    </el-dialog>

    <!-- 分享弹窗 -->
    <el-dialog v-model="shareVisible" title="分享简历" width="500px">
      <div class="share-content">
        <div class="share-link">
          <el-input v-model="shareUrl" readonly>
            <template #append>
              <el-button @click="copyShareLink">复制</el-button>
            </template>
          </el-input>
        </div>
        <div class="share-qrcode">
          <div id="qrcode" ref="qrcodeRef"></div>
          <p>扫描二维码查看简历</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, View, Download, Share } from '@element-plus/icons-vue';
import ResumePreview from './components/ResumePreview.vue';
import { saveResume, getResume, exportResumePdf } from '/@/api/resume';
import { Session } from '/@/utils/storage';

const activeTab = ref('basic');
const currentTemplate = ref('simple');
const previewVisible = ref(false);
const shareVisible = ref(false);
const shareUrl = ref('');
const autoSaveText = ref('已保存');
let autoSaveTimer: ReturnType<typeof setInterval>;

// 技能选项
const allSkills = [
  'JavaScript', 'TypeScript', 'Vue', 'React', 'Angular',
  'Node.js', 'Python', 'Java', 'Go', 'PHP',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'Git', 'Linux',
];

// 简历数据
const resumeData = reactive({
  basic: {
    name: '',
    gender: '',
    age: 0,
    phone: '',
    email: '',
    city: '',
    intention: '',
    salary: '',
    summary: '',
    avatar: '',
  },
  education: [] as any[],
  work: [] as any[],
  project: [] as any[],
  skills: [] as string[],
  otherSkills: '',
  awards: '',
  evaluation: '',
});

// 加载简历数据
const loadResume = async () => {
  try {
    const res = await getResume();
    if (res.data) {
      Object.assign(resumeData, res.data);
    }
  } catch (e) {
    console.log('暂无简历数据');
  }
};

// 保存简历
const saveResumeData = async () => {
  autoSaveText.value = '保存中...';
  try {
    await saveResume(resumeData);
    autoSaveText.value = '已保存 ' + new Date().toLocaleTimeString();
  } catch (e) {
    autoSaveText.value = '保存失败';
  }
};

// 自动保存
const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    saveResumeData();
  }, 30000); // 每30秒自动保存
};

// 头像上传
const handleAvatarChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    resumeData.basic.avatar = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

// 添加/删除教育经历
const addEducation = () => {
  resumeData.education.push({ school: '', degree: '', major: '', dateRange: [] });
};

const removeEducation = (index: number) => {
  resumeData.education.splice(index, 1);
};

// 添加/删除工作经历
const addWork = () => {
  resumeData.work.push({ company: '', position: '', dateRange: [], description: '' });
};

const removeWork = (index: number) => {
  resumeData.work.splice(index, 1);
};

// 添加/删除项目经历
const addProject = () => {
  resumeData.project.push({ name: '', role: '', dateRange: [], tech: '', description: '', achievement: '' });
};

const removeProject = (index: number) => {
  resumeData.project.splice(index, 1);
};

// 预览
const handlePreview = () => {
  previewVisible.value = true;
};

// 导出
const handleExport = async () => {
  try {
    await exportResumePdf(resumeData);
    ElMessage.success('导出成功');
  } catch (e) {
    ElMessage.error('导出失败');
  }
};

// 分享
const handleShare = () => {
  const resumeId = Session.get('resumeId') || 'demo';
  shareUrl.value = `${window.location.origin}/resume/share/${resumeId}`;
  shareVisible.value = true;
};

const copyShareLink = () => {
  navigator.clipboard.writeText(shareUrl.value);
  ElMessage.success('链接已复制');
};

// 监听数据变化自动保存
watch(resumeData, () => {
  autoSaveText.value = '未保存';
}, { deep: true });

onMounted(() => {
  loadResume();
  startAutoSave();
});
</script>

<style scoped lang="scss">
.resume-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    h2 {
      margin: 0;
      font-size: 20px;
    }
    .save-status {
      font-size: 12px;
    }
  }
}

.builder-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.edit-panel {
  width: 500px;
  background: #fff;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;

  .edit-tabs {
    padding: 20px;
  }

  .item-card {
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: bold;
    }
  }

  .add-btn {
    width: 100%;
  }
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e9e9e9;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
  }

  .preview-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
  }
}

.share-content {
  .share-link {
    margin-bottom: 24px;
  }

  .share-qrcode {
    text-align: center;
    #qrcode {
      width: 150px;
      height: 150px;
      margin: 0 auto;
      background: #fff;
      padding: 8px;
    }
    p {
      margin-top: 12px;
      color: #909399;
    }
  }
}
</style>
