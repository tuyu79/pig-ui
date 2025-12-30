<template>
  <div class="text-tool">
    <el-tabs v-model="activeTab" class="text-tabs">
      <el-tab-pane label="文本对比" name="diff">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="文本 A">
              <el-input v-model="textA" type="textarea" :rows="10" placeholder="请输入第一个文本" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="文本 B">
              <el-input v-model="textB" type="textarea" :rows="10" placeholder="请输入第二个文本" />
            </el-card>
          </el-col>
        </el-row>
        <div class="操作区 mt-4">
          <el-button type="primary" @click="compareText">对比</el-button>
          <el-button @click="clearCompare">清空</el-button>
        </div>
        <el-card header="对比结果" class="mt-4">
          <div class="diff-result">
            <div v-html="diffResult" class="diff-content"></div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="去重/排序" name="dedup">
        <el-card header="文本处理">
          <el-input v-model="dedupInput" type="textarea" :rows="10" placeholder="每行一条数据" />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="removeDuplicates">去重</el-button>
            <el-button @click="sortAsc">升序排序</el-button>
            <el-button @click="sortDesc">降序排序</el-button>
            <el-button @click="sortByLengthAsc">按长度升序</el-button>
            <el-button @click="sortByLengthDesc">按长度降序</el-button>
            <el-button @click="clearDedup">清空</el-button>
          </div>
          <el-input v-model="dedupOutput" type="textarea" :rows="10" readonly class="mt-4" placeholder="处理结果" />
          <div class="mt-4">
            <span class="统计信息">共 {{ dedupLines }} 行，去重后 {{ dedupUniqueLines }} 行</span>
            <el-button type="primary" class="ml-4" @click="copyText(dedupOutput)">复制</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="去除空格/空行" name="trim">
        <el-card header="文本处理">
          <el-input v-model="trimInput" type="textarea" :rows="10" placeholder="请输入文本" />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="trimAll">去除首尾空格</el-button>
            <el-button @click="removeEmptyLines">去除空行</el-button>
            <el-button @click="removeAllSpaces">去除所有空格</el-button>
            <el-button @click="compressSpaces">压缩为空格</el-button>
            <el-button @click="clearTrim">清空</el-button>
          </div>
          <el-input v-model="trimOutput" type="textarea" :rows="10" readonly class="mt-4" placeholder="处理结果" />
          <div class="mt-4">
            <el-button type="primary" @click="copyText(trimOutput)">复制</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="分割/合并" name="split">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="分割">
              <el-input v-model="splitInput" type="textarea" :rows="10" placeholder="请输入要分割的文本" />
              <div class="mt-4">
                <span>分隔符：</span>
                <el-input v-model="splitChar" placeholder="默认换行" style="width: 100px" />
              </div>
              <div class="操作区 mt-4">
                <el-button type="primary" @click="splitText">分割</el-button>
                <el-button @click="splitByComma">按逗号分割</el-button>
                <el-button @click="splitBySpace">按空格分割</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="合并">
              <el-input v-model="mergeInput" type="textarea" :rows="10" placeholder="每行一条数据" />
              <div class="mt-4">
                <span>合并符：</span>
                <el-input v-model="mergeChar" placeholder="默认换行" style="width: 100px" />
              </div>
              <div class="操作区 mt-4">
                <el-button type="primary" @click="mergeText">合并</el-button>
                <el-button @click="mergeWithComma">用逗号合并</el-button>
                <el-button @click="mergeWithNewline">换行合并</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="正则表达式" name="regex">
        <el-card header="正则测试">
          <el-input v-model="regexPattern" placeholder="正则表达式，如: \d+" style="margin-bottom: 10px" />
          <el-input v-model="regexFlags" placeholder="标志（可选），如: gmi" style="margin-bottom: 10px; width: 200px" />
          <el-input v-model="regexInput" type="textarea" :rows="5" placeholder="输入要匹配的文本" />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="testRegex">测试匹配</el-button>
            <el-button @click="replaceRegex">替换</el-button>
            <el-button @click="extractRegex">提取所有匹配</el-button>
          </div>
          <el-input v-model="regexReplacement" placeholder="替换文本（可选）" class="mt-4" style="width: 300px" />
          <el-input v-model="regexOutput" type="textarea" :rows="8" readonly class="mt-4" placeholder="匹配结果" />
          <div class="mt-4">
            <span class="统计信息">匹配 {{ regexMatchCount }} 个</span>
            <el-button type="primary" class="ml-4" @click="copyText(regexOutput)">复制</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="简繁转换" name="chinese">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="繁体中文">
              <el-input v-model="traditionalText" type="textarea" :rows="12" placeholder="输入繁体中文" />
              <div class="操作区 mt-4">
                <el-button type="primary" @click="toSimplified">转为简体中文</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="简体中文">
              <el-input v-model="simplifiedText" type="textarea" :rows="12" placeholder="输入简体中文" />
              <div class="操作区 mt-4">
                <el-button type="primary" @click="toTraditional">转为繁体中文</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('diff');

// 文本对比
const textA = ref('');
const textB = ref('');
const diffResult = ref('');

// 去重/排序
const dedupInput = ref('');
const dedupOutput = ref('');
const dedupLines = computed(() => dedupInput.value.split('\n').filter(l => l.trim()).length);
const dedupUniqueLines = computed(() => {
  const lines = dedupInput.value.split('\n').filter(l => l.trim());
  return new Set(lines).size;
});

// 去除空格/空行
const trimInput = ref('');
const trimOutput = ref('');

// 分割/合并
const splitInput = ref('');
const splitChar = ref('\n');
const mergeInput = ref('');
const mergeChar = ref('\n');

// 正则表达式
const regexPattern = ref('');
const regexFlags = ref('');
const regexInput = ref('');
const regexReplacement = ref('');
const regexOutput = ref('');
const regexMatchCount = ref(0);

// 简繁转换
const traditionalText = ref('');
const simplifiedText = ref('');

// 简繁映射表（常用）
const traditionalToSimplified: Record<string, string> = {
  '妳': '你', '妳': '你', '們': '们', '為': '为', '於': '于', '與': '与', '將': '将',
  '會': '会', '說': '说', '時': '时', '這': '这', '那': '那', '裡': '里', '後': '后',
  '來': '来', '對': '对', '過': '过', '還': '还', '車': '车', '東': '东', '魚': '鱼',
  '鳥': '鸟', '書': '书', '筆': '笔', '電': '电', '機': '机', '門': '门', '醫': '医',
  '學': '学', '畫': '画', '話': '话', '愛': '爱', '見': '见', '開': '开', '關': '关',
  '聽': '听', '說': '说', '請': '请', '讓': '让', '從': '从', '向': '向', '把': '把',
  '給': '给', '著': '着', '能': '能', '應該': '应该', '已經': '已经', '因為': '因为',
  '所以': '所以', '但是': '但是', '而且': '而且', '或者': '或者', '如果': '如果',
  '雖然': '虽然', '因為': '因为', '雖然': '虽然', '與其': '与其', '不如': '不如',
  '寧可': '宁可', '與其': '与其', '寧願': '宁愿', '何況': '何况', '不但': '不但',
  '不僅': '不仅', '不管': '不管', '即使': '即使', '只要': '只要', '只有': '只有',
  '除了': '除了', '除非': '除非', '即便': '即便', '就是': '就是', '若是': '若是',
  '倘若': '倘若', '假如': '假如', '假若': '假若', '假使': '假使', '倘若': '倘若',
  '萬一': '万一', '再者': '再者', '況且': '况且', '甚至': '甚至', '尤其': '尤其',
  '特別': '特别', '例如': '例如', '比如': '比如', '正是': '正是', '確實': '确实',
  '應當': '应当', '必須': '必须', '需要': '需要', '可以': '可以', '能夠': '能够',
  '可以': '可以', '可': '可', '會': '会', '要': '要', '想': '想', '願意': '愿意',
  '肯': '肯', '敢': '敢', '應該': '应该', '應': '应', '該': '该', '必須': '必须',
  '必': '必', '須': '须', '需': '需', '要': '要', '想': '想', '要': '要',
  '來': '来', '去': '去', '出': '出', '進': '进', '回': '回', '過': '过',
  '起': '起', '上': '上', '下': '下', '左': '左', '右': '右', '前': '前', '後': '后',
  '裡': '里', '中': '中', '內': '内', '外': '外', '東': '东', '南': '南', '西': '西', '北': '北',
};

const simplifiedToTraditional = Object.fromEntries(
  Object.entries(traditionalToSimplified).map(([k, v]) => [v, k])
) as Record<string, string>;

const copyText = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

// 文本对比
const compareText = () => {
  if (!textA.value || !textB.value) {
    ElMessage.warning('请输入两个文本进行对比');
    return;
  }
  const linesA = textA.value.split('\n');
  const linesB = textB.value('\n');
  let html = '';
  const maxLines = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLines; i++) {
    const lineA = linesA[i] || '';
    const lineB = linesB[i] || '';
    if (lineA === lineB) {
      html += `<div class="diff-same">${i + 1}: ${escapeHtml(lineA)}</div>`;
    } else {
      if (lineA) html += `<div class="diff-removed">- ${escapeHtml(lineA)}</div>`;
      if (lineB) html += `<div class="diff-added">+ ${escapeHtml(lineB)}</div>`;
    }
  }
  diffResult.value = html;
};

const escapeHtml = (text: string) => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const clearCompare = () => {
  textA.value = '';
  textB.value = '';
  diffResult.value = '';
};

// 去重/排序
const removeDuplicates = () => {
  const lines = dedupInput.value.split('\n').filter(l => l.trim());
  dedupOutput.value = [...new Set(lines)].join('\n');
  ElMessage.success('去重完成');
};

const sortAsc = () => {
  const lines = dedupInput.value.split('\n').filter(l => l.trim());
  dedupOutput.value = [...lines].sort().join('\n');
  ElMessage.success('升序排序完成');
};

const sortDesc = () => {
  const lines = dedupInput.value.split('\n').filter(l => l.trim());
  dedupOutput.value = [...lines].sort().reverse().join('\n');
  ElMessage.success('降序排序完成');
};

const sortByLengthAsc = () => {
  const lines = dedupInput.value.split('\n').filter(l => l.trim());
  dedupOutput.value = [...lines].sort((a, b) => a.length - b.length).join('\n');
  ElMessage.success('按长度升序完成');
};

const sortByLengthDesc = () => {
  const lines = dedupInput.value.split('\n').filter(l => l.trim());
  dedupOutput.value = [...lines].sort((a, b) => b.length - a.length).join('\n');
  ElMessage.success('按长度降序完成');
};

const clearDedup = () => {
  dedupInput.value = '';
  dedupOutput.value = '';
};

// 去除空格/空行
const trimAll = () => {
  const lines = trimInput.value.split('\n');
  trimOutput.value = lines.map(l => l.trim()).join('\n');
  ElMessage.success('已去除首尾空格');
};

const removeEmptyLines = () => {
  const lines = trimInput.value.split('\n').filter(l => l.trim());
  trimOutput.value = lines.join('\n');
  ElMessage.success('已去除空行');
};

const removeAllSpaces = () => {
  trimOutput.value = trimInput.value.replace(/\s/g, '');
  ElMessage.success('已去除所有空格');
};

const compressSpaces = () => {
  trimOutput.value = trimInput.value.replace(/\s+/g, ' ');
  ElMessage.success('已压缩为空格');
};

const clearTrim = () => {
  trimInput.value = '';
  trimOutput.value = '';
};

// 分割/合并
const splitText = () => {
  const char = splitChar.value || '\n';
  const lines = splitInput.value.split(char);
  mergeInput.value = lines.filter(l => l.trim()).join('\n');
  ElMessage.success('分割完成');
};

const splitByComma = () => {
  const lines = splitInput.value.split(',').map(l => l.trim());
  mergeInput.value = lines.filter(l => l).join('\n');
  ElMessage.success('按逗号分割完成');
};

const splitBySpace = () => {
  const lines = splitInput.value.split(/\s+/).filter(l => l.trim());
  mergeInput.value = lines.join('\n');
  ElMessage.success('按空格分割完成');
};

const mergeText = () => {
  const char = mergeChar.value || '\n';
  const lines = mergeInput.value.split('\n').filter(l => l.trim());
  splitInput.value = lines.join(char);
  ElMessage.success('合并完成');
};

const mergeWithComma = () => {
  const lines = mergeInput.value.split('\n').filter(l => l.trim());
  splitInput.value = lines.join(', ');
  ElMessage.success('逗号合并完成');
};

const mergeWithNewline = () => {
  const lines = mergeInput.value.split(',').map(l => l.trim());
  splitInput.value = lines.filter(l => l).join('\n');
  ElMessage.success('换行合并完成');
};

// 正则表达式
const testRegex = () => {
  try {
    const flags = regexFlags.value || 'g';
    const regex = new RegExp(regexPattern.value, flags);
    const matches = regexInput.value.match(regex);
    if (matches) {
      regexMatchCount.value = matches.length;
      regexOutput.value = matches.join('\n');
    } else {
      regexMatchCount.value = 0;
      regexOutput.value = '无匹配';
    }
    ElMessage.success('匹配完成');
  } catch (e: any) {
    ElMessage.error(`正则表达式错误: ${e.message}`);
  }
};

const replaceRegex = () => {
  try {
    const flags = regexFlags.value || 'g';
    const regex = new RegExp(regexPattern.value, flags);
    regexOutput.value = regexInput.value.replace(regex, regexReplacement.value);
    ElMessage.success('替换完成');
  } catch (e: any) {
    ElMessage.error(`正则表达式错误: ${e.message}`);
  }
};

const extractRegex = () => {
  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value || 'g');
    const matches = regexInput.value.match(regex);
    if (matches) {
      regexOutput.value = matches.map((m, i) => `${i + 1}: ${m}`).join('\n');
      regexMatchCount.value = matches.length;
    } else {
      regexOutput.value = '无匹配';
      regexMatchCount.value = 0;
    }
    ElMessage.success('提取完成');
  } catch (e: any) {
    ElMessage.error(`正则表达式错误: ${e.message}`);
  }
};

// 简繁转换
const toSimplified = () => {
  let result = traditionalText.value;
  for (const [trad, simp] of Object.entries(traditionalToSimplified)) {
    result = result.split(trad).join(simp);
  }
  simplifiedText.value = result;
  ElMessage.success('已转为简体中文');
};

const toTraditional = () => {
  let result = simplifiedText.value;
  for (const [simp, trad] of Object.entries(simplifiedToTraditional)) {
    result = result.split(simp).join(trad);
  }
  traditionalText.value = result;
  ElMessage.success('已转为繁体中文');
};
</script>

<style lang="scss" scoped>
.text-tool {
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .text-tabs {
    :deep(.el-tabs__content) {
      padding: 20px 0;
    }
  }
  .diff-result {
    .diff-content {
      font-family: monospace;
      white-space: pre-wrap;
      .diff-same { color: #909399; }
      .diff-removed { color: #F56C6C; background: #fef0f0; }
      .diff-added { color: #67C23A; background: #f0f9eb; }
    }
  }
  .统计信息 {
    color: #909399;
    font-size: 14px;
  }
  .ml-4 {
    margin-left: 16px;
  }
  .mt-4 {
    margin-top: 16px;
  }
}
</style>
