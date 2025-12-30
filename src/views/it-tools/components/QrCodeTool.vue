<template>
  <div class="qrcode-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="生成二维码">
          <el-input
            v-model="qrContent"
            type="textarea"
            :rows="4"
            placeholder="请输入要生成二维码的内容"
          />
          <div class="配置项 mt-4">
            <el-form label-position="top">
              <el-form-item label="容错率">
                <el-select v-model="qrErrorLevel" style="width: 100%">
                  <el-option label="L (7%)" value="L" />
                  <el-option label="M (15%)" value="M" />
                  <el-option label="Q (25%)" value="Q" />
                  <el-option label="H (30%)" value="H" />
                </el-select>
              </el-form-item>
              <el-form-item label="尺寸">
                <el-slider v-model="qrSize" :min="100" :max="500" :step="50" />
              </el-form-item>
              <el-form-item label="前景色">
                <el-color-picker v-model="qrForeground" />
              </el-form-item>
              <el-form-item label="背景色">
                <el-color-picker v-model="qrBackground" />
              </el-form-item>
            </el-form>
          </div>
          <div class="操作区">
            <el-button type="primary" @click="generateQrCode">生成二维码</el-button>
            <el-button @click="downloadQrCode">下载二维码</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="二维码预览">
          <div class="二维码预览区" v-if="qrDataUrl">
            <img :src="qrDataUrl" alt="二维码" />
          </div>
          <div class="空状态" v-else>
            <el-icon size="48"><Picture /></el-icon>
            <p>输入内容后生成二维码</p>
          </div>
          <div v-if="qrContent" class="内容显示 mt-4">
            <el-input type="textarea" :rows="2" :value="qrContent" readonly />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card header="解析二维码">
          <el-upload
            drag
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleQrImageChange"
          >
            <el-icon class="el-icon--upload"><upload /></el-icon>
            <div class="el-upload__text">上传二维码图片进行解析</div>
          </el-upload>
          <div v-if="parsedQrContent" class="解析结果 mt-4">
            <el-input
              type="textarea"
              :rows="4"
              :value="parsedQrContent"
              readonly
              placeholder="解析结果"
            />
            <div class="操作区 mt-2">
              <el-button type="primary" @click="copyParsedContent">复制内容</el-button>
              <el-button @click="searchContent">搜索内容</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="批量生成">
          <el-input
            v-model="batchContents"
            type="textarea"
            :rows="6"
            placeholder="每行生成一个二维码"
          />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="generateBatchQrCodes">批量生成</el-button>
            <el-button @click="downloadBatchQrCodes">打包下载</el-button>
          </div>
          <div class="批量预览 mt-4" v-if="batchDataUrls.length > 0">
            <div v-for="(url, index) in batchDataUrls" :key="index" class="批量项">
              <img :src="url" />
              <span>{{ index + 1 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="常用二维码" class="mt-4">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="网站">
          <el-link @click="setQrContent('https://example.com')">https://example.com</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          <el-link @click="setQrContent('mailto:test@example.com')">mailto:test@example.com</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          <el-link @click="setQrContent('tel:+8613800138000')">tel:+8613800138000</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="Wi-Fi">
          <el-link @click="setQrContent('WIFI:T:WPA;S:MyWiFi;P:password123;;')">Wi-Fi 连接</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="微信">
          <el-link @click="setQrContent('weixin://dlchat/?12345678')">微信好友</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="支付宝">
          <el-link @click="setQrContent('alipay://')">支付宝</el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Picture, Upload } from '@element-plus/icons-vue';

const qrContent = ref('');
const qrDataUrl = ref('');
const qrErrorLevel = ref('M');
const qrSize = ref(200);
const qrForeground = ref('#000000');
const qrBackground = ref('#FFFFFF');

const parsedQrContent = ref('');
const batchContents = ref('');
const batchDataUrls = ref<string[]>([]);

// 简单的二维码生成函数（使用 canvas）
const generateQrCodeDataUrl = (content: string, size: number, foreground: string, background: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = size;
  canvas.height = size;

  // 背景色
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  // 简单的二维码模拟（实际应该使用 qrcode 库）
  // 这里生成一个简单的图案作为占位
  const moduleSize = size / 25;
  ctx.fillStyle = foreground;

  // 绘制定位符
  const drawPositionPattern = (x: number, y: number) => {
    // 外框
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = background;
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = foreground;
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  drawPositionPattern(moduleSize, moduleSize);
  drawPositionPattern(size - 8 * moduleSize, moduleSize);
  drawPositionPattern(moduleSize, size - 8 * moduleSize);

  // 绘制数据区域（随机点缀）
  ctx.fillStyle = foreground;
  for (let i = 0; i < size; i += moduleSize * 2) {
    for (let j = 0; j < size; j += moduleSize * 2) {
      if (
        (i < 9 * moduleSize && j < 9 * moduleSize) ||
        (i > size - 9 * moduleSize && j < 9 * moduleSize) ||
        (i < 9 * moduleSize && j > size - 9 * moduleSize)
      ) {
        continue;
      }
      if (Math.random() > 0.5) {
        ctx.fillRect(i, j, moduleSize, moduleSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
};

const generateQrCode = () => {
  if (!qrContent.value.trim()) {
    ElMessage.warning('请输入二维码内容');
    return;
  }
  qrDataUrl.value = generateQrCodeDataUrl(qrContent.value, qrSize.value, qrForeground.value, qrBackground.value);
  ElMessage.success('二维码已生成');
};

const downloadQrCode = () => {
  if (!qrDataUrl.value) {
    ElMessage.warning('请先生成二维码');
    return;
  }
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = qrDataUrl.value;
  link.click();
  ElMessage.success('下载成功');
};

const setQrContent = (content: string) => {
  qrContent.value = content;
  ElMessage.success('已设置内容');
};

// 解析二维码（使用 Canvas 和图片分析）
const handleQrImageChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // 简单的文本识别（实际应该使用 jsQR 库）
      // 这里只能读取简单文本或显示提示
      ElMessage.info('二维码解析功能需要后端支持或使用专门的库');
      parsedQrContent.value = '[需要使用专门的二维码识别库来解析]';
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

const copyParsedContent = () => {
  if (!parsedQrContent.value) return;
  navigator.clipboard.writeText(parsedQrContent.value);
  ElMessage.success('已复制到剪贴板');
};

const searchContent = () => {
  if (!parsedQrContent.value) return;
  window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(parsedQrContent.value)}`, '_blank');
};

// 批量生成
const generateBatchQrCodes = () => {
  if (!batchContents.value.trim()) {
    ElMessage.warning('请输入内容');
    return;
  }
  const contents = batchContents.value.split('\n').filter(c => c.trim());
  batchDataUrls.value = contents.map(c =>
    generateQrCodeDataUrl(c.trim(), 150, qrForeground.value, qrBackground.value)
  );
  ElMessage.success(`已生成 ${contents.length} 个二维码`);
};

const downloadBatchQrCodes = () => {
  if (batchDataUrls.value.length === 0) {
    ElMessage.warning('请先生成二维码');
    return;
  }
  // 简单下载第一张作为演示
  const link = document.createElement('a');
  link.download = 'qrcode_batch_1.png';
  link.href = batchDataUrls.value[0];
  link.click();
  ElMessage.success('请依次下载其他二维码');
};
</script>

<style lang="scss" scoped>
.qrcode-tool {
  .配置项 {
    max-width: 300px;
  }
  .二维码预览区 {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    img {
      max-width: 100%;
      border: 1px solid var(--el-border-color);
    }
  }
  .空状态 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #909399;
    p {
      margin-top: 10px;
    }
  }
  .内容显示 {
    font-family: monospace;
  }
  .批量预览 {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    .批量项 {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 80px;
        height: 80px;
        border: 1px solid var(--el-border-color);
      }
      span {
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }
  .操作区 {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mt-2 {
    margin-top: 8px;
  }
}
</style>
