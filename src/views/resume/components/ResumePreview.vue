<template>
  <div class="resume-preview" :class="[`template-${template}`]">
    <!-- 简约模板 -->
    <div v-if="template === 'simple'" class="resume-paper simple-template">
      <div class="simple-header" v-if="data.basic">
        <div class="avatar-wrap" v-if="data.basic.avatar">
          <img :src="data.basic.avatar" class="avatar" />
        </div>
        <div class="basic-info">
          <h1 class="name">{{ data.basic.name || '姓名' }}</h1>
          <p class="intention">{{ data.basic.intention || '求职意向' }}</p>
          <div class="contact-info">
            <span v-if="data.basic.phone">{{ data.basic.phone }}</span>
            <span v-if="data.basic.email">{{ data.basic.email }}</span>
            <span v-if="data.basic.city">{{ data.basic.city }}</span>
          </div>
        </div>
      </div>

      <div class="simple-section" v-if="data.basic?.summary">
        <h3 class="section-title">个人优势</h3>
        <p class="section-content">{{ data.basic.summary }}</p>
      </div>

      <div class="simple-section" v-if="data.education?.length">
        <h3 class="section-title">教育经历</h3>
        <div class="section-list">
          <div class="section-item" v-for="(edu, index) in data.education" :key="index">
            <div class="item-header">
              <span class="item-title">{{ edu.school }}</span>
              <span class="item-date">{{ edu.dateRange?.[0] }} - {{ edu.dateRange?.[1] }}</span>
            </div>
            <div class="item-sub">{{ edu.degree }} | {{ edu.major }}</div>
          </div>
        </div>
      </div>

      <div class="simple-section" v-if="data.work?.length">
        <h3 class="section-title">工作经历</h3>
        <div class="section-list">
          <div class="section-item" v-for="(work, index) in data.work" :key="index">
            <div class="item-header">
              <span class="item-title">{{ work.company }}</span>
              <span class="item-date">{{ work.dateRange?.[0] }} - {{ work.dateRange?.[1] }}</span>
            </div>
            <div class="item-sub">{{ work.position }}</div>
            <div class="item-desc">{{ work.description }}</div>
          </div>
        </div>
      </div>

      <div class="simple-section" v-if="data.project?.length">
        <h3 class="section-title">项目经历</h3>
        <div class="section-list">
          <div class="section-item" v-for="(proj, index) in data.project" :key="index">
            <div class="item-header">
              <span class="item-title">{{ proj.name }}</span>
              <span class="item-date">{{ proj.dateRange?.[0] }} - {{ proj.dateRange?.[1] }}</span>
            </div>
            <div class="item-sub">{{ proj.role }} | {{ proj.tech }}</div>
            <div class="item-desc">{{ proj.achievement }}</div>
          </div>
        </div>
      </div>

      <div class="simple-section" v-if="data.skills?.length || data.otherSkills">
        <h3 class="section-title">技能特长</h3>
        <div class="skills-wrap">
          <el-tag v-for="skill in data.skills" :key="skill" size="small" class="skill-tag">{{ skill }}</el-tag>
        </div>
        <p v-if="data.otherSkills" class="other-skills">{{ data.otherSkills }}</p>
      </div>

      <div class="simple-section" v-if="data.awards">
        <h3 class="section-title">荣誉奖项</h3>
        <p class="section-content">{{ data.awards }}</p>
      </div>

      <div class="simple-section" v-if="data.evaluation">
        <h3 class="section-title">自我评价</h3>
        <p class="section-content">{{ data.evaluation }}</p>
      </div>
    </div>

    <!-- 专业模板 -->
    <div v-else-if="template === 'professional'" class="resume-paper professional-template">
      <div class="prof-header">
        <div class="prof-left" v-if="data.basic">
          <h1 class="prof-name">{{ data.basic.name || '姓名' }}</h1>
          <p class="prof-intention">{{ data.basic.intention || '求职意向' }}</p>
          <div class="prof-contact">
            <p v-if="data.basic.phone"><i class="icon">📱</i> {{ data.basic.phone }}</p>
            <p v-if="data.basic.email"><i class="icon">📧</i> {{ data.basic.email }}</p>
            <p v-if="data.basic.city"><i class="icon">📍</i> {{ data.basic.city }}</p>
          </div>
        </div>
        <div class="prof-right" v-if="data.basic?.avatar">
          <img :src="data.basic.avatar" class="avatar" />
        </div>
      </div>

      <div class="prof-sidebar" v-if="data.basic?.summary">
        <div class="sidebar-section">
          <h4>个人优势</h4>
          <p>{{ data.basic.summary }}</p>
        </div>
      </div>

      <div class="prof-main">
        <div class="prof-section" v-if="data.education?.length">
          <h3 class="prof-section-title">教育背景</h3>
          <div class="prof-item" v-for="(edu, index) in data.education" :key="index">
            <div class="prof-item-header">
              <span class="prof-item-title">{{ edu.school }}</span>
              <span class="prof-item-date">{{ edu.dateRange?.[0] }} - {{ edu.dateRange?.[1] }}</span>
            </div>
            <p class="prof-item-sub">{{ edu.degree }} · {{ edu.major }}</p>
          </div>
        </div>

        <div class="prof-section" v-if="data.work?.length">
          <h3 class="prof-section-title">工作经历</h3>
          <div class="prof-item" v-for="(work, index) in data.work" :key="index">
            <div class="prof-item-header">
              <span class="prof-item-title">{{ work.company }}</span>
              <span class="prof-item-date">{{ work.dateRange?.[0] }} - {{ work.dateRange?.[1] }}</span>
            </div>
            <p class="prof-item-sub">{{ work.position }}</p>
            <p class="prof-item-desc">{{ work.description }}</p>
          </div>
        </div>

        <div class="prof-section" v-if="data.project?.length">
          <h3 class="prof-section-title">项目经历</h3>
          <div class="prof-item" v-for="(proj, index) in data.project" :key="index">
            <div class="prof-item-header">
              <span class="prof-item-title">{{ proj.name }}</span>
              <span class="prof-item-date">{{ proj.dateRange?.[0] }} - {{ proj.dateRange?.[1] }}</span>
            </div>
            <p class="prof-item-sub">{{ proj.role }} · {{ proj.tech }}</p>
            <p class="prof-item-desc">{{ proj.achievement }}</p>
          </div>
        </div>

        <div class="prof-section" v-if="data.skills?.length">
          <h3 class="prof-section-title">专业技能</h3>
          <div class="prof-skills">
            <span class="skill-item" v-for="skill in data.skills" :key="skill">{{ skill }}</span>
          </div>
        </div>

        <div class="prof-section" v-if="data.awards || data.evaluation">
          <h3 class="prof-section-title">自我评价</h3>
          <p class="prof-item-desc">{{ data.evaluation || data.awards }}</p>
        </div>
      </div>
    </div>

    <!-- 创意模板 -->
    <div v-else-if="template === 'creative'" class="resume-paper creative-template">
      <div class="creative-header">
        <div class="creative-bg"></div>
        <div class="creative-info" v-if="data.basic">
          <div class="creative-avatar" v-if="data.basic.avatar">
            <img :src="data.basic.avatar" class="avatar" />
          </div>
          <h1 class="creative-name">{{ data.basic.name || '姓名' }}</h1>
          <p class="creative-intention">{{ data.basic.intention || '求职意向' }}</p>
          <div class="creative-tags">
            <span v-if="data.basic.city">{{ data.basic.city }}</span>
            <span v-if="data.basic.phone">{{ data.basic.phone }}</span>
            <span v-if="data.basic.email">{{ data.basic.email }}</span>
          </div>
        </div>
      </div>

      <div class="creative-body">
        <div class="creative-left">
          <div class="creative-section" v-if="data.basic?.summary">
            <h3><i class="icon">✦</i> 个人优势</h3>
            <p>{{ data.basic.summary }}</p>
          </div>

          <div class="creative-section" v-if="data.skills?.length">
            <h3><i class="icon">⚡</i> 技能特长</h3>
            <div class="skill-bars">
              <div class="skill-bar" v-for="skill in data.skills.slice(0, 8)" :key="skill">
                <span class="skill-name">{{ skill }}</span>
              </div>
            </div>
          </div>

          <div class="creative-section" v-if="data.evaluation">
            <h3><i class="icon">💫</i> 自我评价</h3>
            <p>{{ data.evaluation }}</p>
          </div>
        </div>

        <div class="creative-right">
          <div class="creative-section" v-if="data.education?.length">
            <h3><i class="icon">🎓</i> 教育经历</h3>
            <div class="timeline">
              <div class="timeline-item" v-for="(edu, index) in data.education" :key="index">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>{{ edu.school }}</h4>
                  <p>{{ edu.degree }} · {{ edu.major }}</p>
                  <span class="timeline-date">{{ edu.dateRange?.[0] }} - {{ edu.dateRange?.[1] }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="creative-section" v-if="data.work?.length">
            <h3><i class="icon">💼</i> 工作经历</h3>
            <div class="timeline">
              <div class="timeline-item" v-for="(work, index) in data.work" :key="index">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>{{ work.company }}</h4>
                  <p>{{ work.position }}</p>
                  <span class="timeline-date">{{ work.dateRange?.[0] }} - {{ work.dateRange?.[1] }}</span>
                  <p class="timeline-desc">{{ work.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="creative-section" v-if="data.project?.length">
            <h3><i class="icon">🚀</i> 项目经历</h3>
            <div class="timeline">
              <div class="timeline-item" v-for="(proj, index) in data.project" :key="index">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>{{ proj.name }}</h4>
                  <p>{{ proj.role }} · {{ proj.tech }}</p>
                  <span class="timeline-date">{{ proj.dateRange?.[0] }} - {{ proj.dateRange?.[1] }}</span>
                  <p class="timeline-desc">{{ proj.achievement }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="creative-section" v-if="data.awards">
            <h3><i class="icon">🏆</i> 荣誉奖项</h3>
            <p class="awards-text">{{ data.awards }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any;
  template: string;
}>();
</script>

<style scoped lang="scss">
.resume-preview {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.resume-paper {
  background: #fff;
  min-height: 1131px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

// 简约模板
.template-simple {
  .simple-template {
    padding: 40px;
    font-family: 'Microsoft YaHei', sans-serif;
  }

  .simple-header {
    display: flex;
    align-items: center;
    gap: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #333;
    margin-bottom: 20px;

    .avatar-wrap {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .basic-info {
      .name {
        font-size: 28px;
        font-weight: bold;
        margin: 0 0 5px 0;
      }

      .intention {
        font-size: 16px;
        color: #666;
        margin: 0 0 10px 0;
      }

      .contact-info {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #999;
      }
    }
  }

  .simple-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      border-left: 4px solid #409eff;
      padding-left: 12px;
      margin: 0 0 15px 0;
    }

    .section-content {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .section-list {
      .section-item {
        margin-bottom: 15px;

        .item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;

          .item-title {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }

          .item-date {
            font-size: 13px;
            color: #999;
          }
        }

        .item-sub {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .item-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }
    }

    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .skill-tag {
        background: #f0f0f0;
        border: none;
        border-radius: 4px;
      }
    }

    .other-skills {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
      white-space: pre-wrap;
    }
  }
}

// 专业模板
.template-professional {
  .professional-template {
    display: flex;
    min-height: 1131px;
    font-family: 'Microsoft YaHei', sans-serif;
  }

  .prof-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 40px;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: #fff;

    .prof-left {
      .prof-name {
        font-size: 32px;
        font-weight: bold;
        margin: 0 0 10px 0;
      }

      .prof-intention {
        font-size: 18px;
        margin: 0 0 20px 0;
        opacity: 0.9;
      }

      .prof-contact {
        p {
          margin: 8px 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;

          .icon {
            font-style: normal;
          }
        }
      }
    }

    .prof-right {
      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        object-fit: cover;
        border: 3px solid rgba(255, 255, 255, 0.3);
      }
    }
  }

  .prof-sidebar {
    width: 280px;
    background: #f8f9fa;
    padding: 30px 20px;

    .sidebar-section {
      margin-bottom: 30px;

      h4 {
        font-size: 14px;
        font-weight: bold;
        color: #2c3e50;
        margin: 0 0 10px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #3498db;
      }

      p {
        font-size: 13px;
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .prof-main {
    flex: 1;
    padding: 30px;

    .prof-section {
      margin-bottom: 25px;

      .prof-section-title {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
        margin: 0 0 15px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #3498db;
      }

      .prof-item {
        margin-bottom: 15px;

        .prof-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;

          .prof-item-title {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }

          .prof-item-date {
            font-size: 13px;
            color: #999;
          }
        }

        .prof-item-sub {
          font-size: 14px;
          color: #666;
          margin: 0 0 5px 0;
        }

        .prof-item-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }

      .prof-skills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .skill-item {
          background: #3498db;
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
        }
      }
    }
  }
}

// 创意模板
.template-creative {
  .creative-template {
    font-family: 'Microsoft YaHei', sans-serif;
  }

  .creative-header {
    position: relative;
    padding: 60px 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    .creative-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2"/></svg>');
      background-size: 100px;
    }

    .creative-info {
      position: relative;
      text-align: center;

      .creative-avatar {
        width: 120px;
        height: 120px;
        margin: 0 auto 20px;
        border-radius: 50%;
        border: 4px solid rgba(255, 255, 255, 0.3);
        overflow: hidden;

        .avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .creative-name {
        font-size: 36px;
        font-weight: bold;
        margin: 0 0 10px 0;
      }

      .creative-intention {
        font-size: 18px;
        margin: 0 0 20px 0;
        opacity: 0.9;
      }

      .creative-tags {
        display: flex;
        justify-content: center;
        gap: 15px;

        span {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
        }
      }
    }
  }

  .creative-body {
    display: flex;
    padding: 40px;

    .creative-left {
      width: 35%;
      padding-right: 30px;
      border-right: 1px solid #eee;
    }

    .creative-right {
      width: 65%;
      padding-left: 30px;
    }

    .creative-section {
      margin-bottom: 30px;

      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #764ba2;
        margin: 0 0 15px 0;
        display: flex;
        align-items: center;
        gap: 8px;

        .icon {
          font-style: normal;
        }
      }

      p {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        white-space: pre-wrap;
      }

      .skill-bars {
        .skill-bar {
          margin-bottom: 10px;

          .skill-name {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 13px;
          }
        }
      }

      .timeline {
        .timeline-item {
          position: relative;
          padding-left: 20px;
          margin-bottom: 20px;

          .timeline-dot {
            position: absolute;
            left: 0;
            top: 5px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .timeline-content {
            h4 {
              font-size: 15px;
              font-weight: 500;
              color: #333;
              margin: 0 0 5px 0;
            }

            p {
              font-size: 13px;
              color: #666;
              margin: 0 0 5px 0;
            }

            .timeline-date {
              font-size: 12px;
              color: #999;
            }

            .timeline-desc {
              margin-top: 8px;
            }
          }
        }
      }

      .awards-text {
        font-size: 14px;
        color: #666;
        line-height: 1.8;
      }
    }
  }
}
</style>
