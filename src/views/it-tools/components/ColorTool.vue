<template>
  <div class="color-tool">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card header="颜色输入">
          <el-form label-position="top">
            <el-form-item label="颜色值">
              <el-input v-model="inputColor" placeholder="#FFFFFF" @blur="parseInputColor">
                <template #prepend>HEX</template>
              </el-input>
            </el-form-item>
          </el-form>
          <el-color-picker v-model="inputColor" @change="handleColorPickerChange" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="颜色预览">
          <div class="颜色预览区" :style="{ backgroundColor: currentColor }">
            <span class="颜色文本">{{ currentColor }}</span>
          </div>
          <div class="颜色信息 mt-4">
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="RGB">
                {{ rgbValue }}
                <el-button text type="primary" size="small" @click="copyText(rgbValue)">复制</el-button>
              </el-descriptions-item>
              <el-descriptions-item label="HSL">
                {{ hslValue }}
                <el-button text type="primary" size="small" @click="copyText(hslValue)">复制</el-button>
              </el-descriptions-item>
              <el-descriptions-item label="HSV">
                {{ hsvValue }}
                <el-button text type="primary" size="small" @click="copyText(hsvValue)">复制</el-button>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="转换结果">
          <el-form label-position="top">
            <el-form-item label="HEX">
              <el-input v-model="hexResult" readonly>
                <template #append>
                  <el-button @click="copyText(hexResult)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="RGB">
              <el-input v-model="rgbResult" readonly>
                <template #append>
                  <el-button @click="copyText(rgbResult)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="RGBA">
              <el-input v-model="rgbaResult" readonly>
                <template #append>
                  <el-button @click="copyText(rgbaResult)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="调色板生成" class="mt-4">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="基础颜色">
            <el-color-picker v-model="baseColor" @change="generatePalette" />
          </el-form-item>
          <el-form-item label="变体数量">
            <el-slider v-model="paletteCount" :min="5" :max="20" @change="generatePalette" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <div class="调色板">
            <div
              v-for="color in palette"
              :key="color"
              class="调色板项"
              :style="{ backgroundColor: color }"
              @click="copyText(color)"
            >
              <span class="调色板文本">{{ color }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card header="常用颜色" class="mt-4">
      <div class="常用颜色">
        <div
          v-for="color in commonColors"
          :key="color.hex"
          class="常用颜色项"
          :style="{ backgroundColor: color.hex }"
          @click="selectColor(color.hex)"
        >
          <span class="颜色名">{{ color.name }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const inputColor = ref('#409EFF');
const baseColor = ref('#409EFF');
const paletteCount = ref(10);
const palette = ref<string[]>([]);
const currentColor = ref('#409EFF');

const commonColors = [
  { name: '红色', hex: '#F56C6C' },
  { name: '橙色', hex: '#E6A23C' },
  { name: '黄色', hex: '#F7BA2A' },
  { name: '绿色', hex: '#67C23A' },
  { name: '青色', hex: '#909399' },
  { name: '蓝色', hex: '#409EFF' },
  { name: '紫色', hex: '#9c27b0' },
  { name: '粉色', hex: '#e91e63' },
  { name: '灰色', hex: '#909399' },
  { name: '黑色', hex: '#303133' },
  { name: '白色', hex: '#FFFFFF' },
  { name: '成功', hex: '#67C23A' },
  { name: '警告', hex: '#E6A23C' },
  { name: '危险', hex: '#F56C6C' },
  { name: '信息', hex: '#909399' },
];

// HEX to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

// RGB to HEX
const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// RGB to HSL
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

// RGB to HSV
const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

const handleColorPickerChange = (color: string) => {
  currentColor.value = color;
  inputColor.value = color;
  updateResults(color);
};

const parseInputColor = () => {
  let hex = inputColor.value;
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    currentColor.value = hex;
    updateResults(hex);
  } else {
    ElMessage.error('颜色格式不正确，请输入 #FFFFFF 格式');
  }
};

const updateResults = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (rgb) {
    rgbResult.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    rgbaResult.value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    hexResult.value = hex.toUpperCase();

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hslValue.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    hsvValue.value = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
  }
};

const rgbValue = computed(() => {
  const rgb = hexToRgb(currentColor.value);
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
});

const hslValue = ref('');
const hsvValue = ref('');
const hexResult = ref('');
const rgbResult = ref('');
const rgbaResult = ref('');

const selectColor = (color: string) => {
  inputColor.value = color;
  currentColor.value = color;
  updateResults(color);
};

const generatePalette = () => {
  const rgb = hexToRgb(baseColor.value);
  if (!rgb) return;

  const colors: string[] = [];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  for (let i = 0; i < paletteCount.value; i++) {
    const lightness = 100 - (i / (paletteCount.value - 1)) * 90;
    const s = hsl.s;
    const newHsl = { h: hsl.h, s, l: lightness };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }

  palette.value = colors;
};

// HSL to RGB
const hslToRgb = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

// 初始化
updateResults(inputColor.value);
generatePalette();
</script>

<style lang="scss" scoped>
.color-tool {
  .颜色预览区 {
    height: 100px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--el-border-color);
  }
  .颜色文本 {
    font-size: 16px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  }
  .调色板 {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .调色板项 {
      width: 60px;
      height: 40px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      &:hover {
        transform: scale(1.1);
      }
      .调色板文本 {
        font-size: 10px;
        color: #fff;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
      }
    }
  }
  .常用颜色 {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .常用颜色项 {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 5px;
      transition: transform 0.2s;
      border: 1px solid var(--el-border-color);
      &:hover {
        transform: translateY(-3px);
      }
      .颜色名 {
        font-size: 10px;
        color: #fff;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
      }
    }
  }
  .mt-4 {
    margin-top: 16px;
  }
}
</style>
