<template>
  <div class="color-picker-tool">
    <el-tabs v-model="activeTab" class="color-tabs">
      <el-tab-pane label="屏幕取色" name="screen">
        <el-card header="屏幕颜色拾取器">
          <div class="取色说明">
            <el-alert type="info" :closable="false">
              点击"开始取色"按钮后，鼠标指针会变成取色器形状。将鼠标移动到任意位置，按下鼠标左键即可获取该位置的颜色值。
            </el-alert>
          </div>
          <div class="取色预览 mt-4">
            <div class="颜色方块" :style="{ backgroundColor: pickedColor }"></div>
            <div class="颜色信息">
              <div class="颜色值">{{ pickedColor }}</div>
              <div class="颜色值-rgb">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
              <div class="颜色值-hsl">HSL({{ hslValues.h }}, {{ hslValues.s }}%, {{ hslValues.l }}%)</div>
            </div>
          </div>
          <div class="操作区 mt-4">
            <el-button type="primary" @click="startPicker" :disabled="isPicking">
              {{ isPicking ? '取色中...' : '开始取色' }}
            </el-button>
            <el-button @click="stopPicker" v-if="isPicking">停止</el-button>
            <el-button @click="copyPickedColor">复制 HEX</el-button>
            <el-button @click="copyPickedRgb">复制 RGB</el-button>
          </div>
          <div class="历史颜色 mt-4">
            <div class="标题">历史记录</div>
            <div class="颜色列表">
              <div
                v-for="(color, index) in colorHistory"
                :key="index"
                class="历史项"
                :style="{ backgroundColor: color }"
                @click="selectHistoryColor(color)"
                title="点击复制"
              ></div>
            </div>
            <el-button size="small" @click="clearHistory" class="mt-2">清空历史</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="图片取色" name="image">
        <el-card header="图片颜色提取">
          <el-upload
            drag
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleImageChange"
          >
            <el-icon class="el-icon--upload"><upload /></el-icon>
            <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
          </el-upload>
          <div v-if="imageUrl" class="图片预览 mt-4">
            <div class="图片容器" ref="imageContainer">
              <img :src="imageUrl" @load="onImageLoaded" ref="imageRef" />
              <div
                class="取色点"
                :style="{
                  left: pickerPos.x + 'px',
                  top: pickerPos.y + 'px',
                  display: imageUrl ? 'block' : 'none'
                }"
              ></div>
            </div>
            <div class="图片颜色信息 mt-4">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="颜色方块" :style="{ backgroundColor: imagePickedColor }"></div>
                </el-col>
                <el-col :span="16">
                  <div class="颜色值">{{ imagePickedColor }}</div>
                  <div class="颜色值-rgb">RGB({{ imageRgb.r }}, {{ imageRgb.g }}, {{ imageRgb.b }})</div>
                  <div class="操作区 mt-2">
                    <el-button size="small" @click="copyImageColor">复制颜色</el-button>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="颜色选择器" name="picker">
        <el-card header="颜色选择">
          <el-color-picker v-model="manualColor" @change="onManualColorChange" size="large" />
          <div class="颜色显示 mt-4">
            <div class="颜色方块大" :style="{ backgroundColor: manualColor }"></div>
            <div class="颜色详情">
              <div class="颜色值">{{ manualColor }}</div>
              <div class="颜色值-rgb">{{ manualRgb }}</div>
            </div>
          </div>
          <el-button type="primary" class="mt-4" @click="copyManualColor">复制颜色</el-button>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';

const activeTab = ref('screen');
const isPicking = ref(false);
const pickedColor = ref('#409EFF');
const rgbValues = reactive({ r: 64, g: 159, b: 239 });
const hslValues = reactive({ h: 210, s: 77, l: 59 });
const colorHistory = ref<string[]>([]);

const imageUrl = ref('');
const imageRef = ref<HTMLImageElement>();
const imageContainer = ref<HTMLElement>();
const pickerPos = reactive({ x: 0, y: 0 });
const imagePickedColor = ref('#409EFF');
const imageRgb = reactive({ r: 64, g: 159, b: 239 });

const manualColor = ref('#409EFF');

const manualRgb = computed(() => {
  const rgb = hexToRgb(manualColor.value);
  return rgb ? `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
});

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const startPicker = async () => {
  try {
    // 创建隐藏的 canvas 用于绘制屏幕
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d')!;

    isPicking.value = true;
    document.body.style.cursor = 'crosshair';

    // 监听鼠标点击
    const handleClick = async (e: MouseEvent) => {
      const x = e.screenX;
      const y = e.screenY;

      // 获取屏幕尺寸
      canvas.width = 1;
      canvas.height = 1;

      try {
        // 使用 IPC 捕获屏幕（在浏览器中无法直接访问其他窗口的像素）
        // 这里使用替代方案：显示取色坐标
        ElMessage.info(`位置: (${x}, ${y})，请使用系统取色工具获取精确颜色值`);
      } catch (err) {
        ElMessage.error('无法获取屏幕颜色');
      }
    };

    // 使用eyedropper API（如果浏览器支持）
    if ('EyeDropper' in window) {
      const eyeDropper = new (window as any).EyeDropper();
      try {
        const result = await eyeDropper.open();
        pickedColor.value = result.sRGBHex;
        updateColorValues(result.sRGBHex);
        addToHistory(result.sRGBHex);
        stopPicker();
      } catch (e) {
        // 用户取消
        stopPicker();
      }
    } else {
      // 浏览器不支持 EyeDropper API，显示提示
      ElMessage.warning('您的浏览器不支持屏幕取色 API，请使用系统取色工具或尝试 Chrome 93+ 版本');
      stopPicker();
    }
  } catch (e) {
    ElMessage.error('启动取色器失败');
    stopPicker();
  }
};

const stopPicker = () => {
  isPicking.value = false;
  document.body.style.cursor = '';
};

const updateColorValues = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (rgb) {
    rgbValues.r = rgb.r;
    rgbValues.g = rgb.g;
    rgbValues.b = rgb.b;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hslValues.h = hsl.h;
    hslValues.s = hsl.s;
    hslValues.l = hsl.l;
  }
};

const addToHistory = (color: string) => {
  if (!colorHistory.value.includes(color)) {
    colorHistory.value.unshift(color);
    if (colorHistory.value.length > 10) {
      colorHistory.value.pop();
    }
  }
};

const copyPickedColor = () => {
  navigator.clipboard.writeText(pickedColor.value);
  ElMessage.success('HEX 颜色已复制');
};

const copyPickedRgb = () => {
  const rgb = `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`;
  navigator.clipboard.writeText(rgb);
  ElMessage.success('RGB 颜色已复制');
};

const selectHistoryColor = (color: string) => {
  pickedColor.value = color;
  updateColorValues(color);
  navigator.clipboard.writeText(color);
  ElMessage.success('颜色已复制');
};

const clearHistory = () => {
  colorHistory.value = [];
  ElMessage.success('历史记录已清空');
};

// 图片取色
const handleImageChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

const onImageLoaded = () => {
  if (!imageRef.value || !imageContainer.value) return;

  imageRef.value.addEventListener('mousemove', onImageMouseMove);
  imageRef.value.addEventListener('click', onImageClick);
};

const onImageMouseMove = (e: MouseEvent) => {
  if (!imageRef.value || !imageContainer.value) return;

  const rect = imageRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  pickerPos.x = x;
  pickerPos.y = y;
};

const onImageClick = (e: MouseEvent) => {
  if (!imageRef.value) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageRef.value.naturalWidth;
  canvas.height = imageRef.value.naturalHeight;

  ctx.drawImage(imageRef.value, 0, 0);

  const rect = imageRef.value.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

  imagePickedColor.value = hex;
  imageRgb.r = pixel[0];
  imageRgb.g = pixel[1];
  imageRgb.b = pixel[2];
  addToHistory(hex);
};

const copyImageColor = () => {
  navigator.clipboard.writeText(imagePickedColor.value);
  ElMessage.success('颜色已复制');
};

const onManualColorChange = (color: string) => {
  if (color) {
    addToHistory(color);
  }
};

const copyManualColor = () => {
  navigator.clipboard.writeText(manualColor.value);
  ElMessage.success('颜色已复制');
};

onUnmounted(() => {
  stopPicker();
  if (imageRef.value) {
    imageRef.value.removeEventListener('mousemove', onImageMouseMove);
    imageRef.value.removeEventListener('click', onImageClick);
  }
});
</script>

<style lang="scss" scoped>
.color-picker-tool {
  .取色说明 {
    margin-bottom: 10px;
  }
  .取色预览 {
    display: flex;
    align-items: center;
    gap: 20px;
    .颜色方块 {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      border: 2px solid var(--el-border-color);
    }
    .颜色信息 {
      .颜色值 {
        font-size: 24px;
        font-weight: bold;
        font-family: monospace;
      }
      .颜色值-rgb, .颜色值-hsl {
        margin-top: 8px;
        color: #909399;
        font-family: monospace;
      }
    }
  }
  .历史颜色 {
    .标题 {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .颜色列表 {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .历史项 {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--el-border-color);
      transition: transform 0.2s;
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  .图片预览 {
    .图片容器 {
      position: relative;
      display: inline-block;
      img {
        max-width: 100%;
        max-height: 400px;
        cursor: crosshair;
      }
      .取色点 {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
    }
    .颜色方块 {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      border: 2px solid var(--el-border-color);
    }
    .颜色值 {
      font-size: 18px;
      font-weight: bold;
      font-family: monospace;
    }
    .颜色值-rgb {
      margin-top: 8px;
      color: #909399;
      font-family: monospace;
    }
  }
  .颜色显示 {
    display: flex;
    align-items: center;
    gap: 20px;
    .颜色方块大 {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      border: 2px solid var(--el-border-color);
    }
    .颜色详情 {
      .颜色值 {
        font-size: 24px;
        font-weight: bold;
        font-family: monospace;
      }
      .颜色值-rgb {
        margin-top: 10px;
        color: #909399;
        font-family: monospace;
      }
    }
  }
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .color-tabs {
    :deep(.el-tabs__content) {
      padding: 20px 0;
    }
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mt-2 {
    margin-top: 8px;
  }
}
</style>
