<template>
  <div class="uuid-tool">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="UUID 生成">
          <div class="UUID版本">
            <el-radio-group v-model="uuidVersion">
              <el-radio value="v1">UUID v1 (时间戳)</el-radio>
              <el-radio value="v4">UUID v4 (随机)</el-radio>
            </el-radio-group>
          </div>
          <div class="UUID显示">
            <el-input v-model="generatedUuid" readonly size="large">
              <template #append>
                <el-button @click="copyUuid">复制</el-button>
              </template>
            </el-input>
          </div>
          <div class="操作区 mt-4">
            <el-button type="primary" @click="generateUuid">生成</el-button>
            <el-button @click="generateBatchUuid">批量生成</el-button>
            <el-button @click="copyAllUuid">复制全部</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="UUID 格式">
          <el-form label-position="top">
            <el-form-item label="格式">
              <el-select v-model="uuidFormat" style="width: 100%">
                <el-option label="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value="standard" />
                <el-option label="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value="compact" />
                <el-option label="{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}" value="braced" />
                <el-option label="urn:uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value="urn" />
              </el-select>
            </el-form-item>
            <el-form-item label="大小写">
              <el-radio-group v-model="uuidCase">
                <el-radio value="lower">小写</el-radio>
                <el-radio value="upper">大写</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="批量生成" class="mt-4">
      <el-form label-position="top">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="数量">
              <el-input-number v-model="batchCount" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="前缀（可选）">
              <el-input v-model="uuidPrefix" placeholder="如: user_" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="后缀（可选）">
              <el-input v-model="uuidSuffix" placeholder="如: _id" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-input
        type="textarea"
        :rows="10"
        :value="batchUuids"
        readonly
        placeholder="批量生成的 UUID"
        class="mt-4"
      />
      <div class="操作区 mt-4">
        <el-button type="primary" @click="downloadUuidList">下载列表</el-button>
        <el-button @click="copyBatchUuid">复制全部</el-button>
      </div>
    </el-card>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card header="UUID 验证">
          <el-input v-model="validateUuid" placeholder="输入 UUID 进行验证" />
          <div class="验证结果 mt-4">
            <el-tag :type="isValidUuid ? 'success' : 'info'" size="large">
              {{ isValidUuid ? '有效的 UUID' : '请输入 UUID' }}
            </el-tag>
          </div>
          <div v-if="uuidInfo" class="UUID信息 mt-4">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="版本">
                {{ uuidInfo.version }}
              </el-descriptions-item>
              <el-descriptions-item label="变体">
                {{ uuidInfo.variant }}
              </el-descriptions-item>
              <el-descriptions-item label="时间戳" v-if="uuidInfo.timestamp">
                {{ uuidInfo.timestamp }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="UUID 转其他格式">
          <el-input v-model="convertInput" placeholder="输入 UUID" />
          <div class="转换结果 mt-4">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="原始">
                {{ convertInput }}
              </el-descriptions-item>
              <el-descriptions-item label="Base64">
                {{ toBase64(convertInput) }}
              </el-descriptions-item>
              <el-descriptions-item label="数值">
                {{ toNumber(convertInput) }}
              </el-descriptions-item>
              <el-descriptions-item label="整数数组">
                {{ toIntArray(convertInput) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="常用 UUID" class="mt-4">
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="空 UUID">
          <el-link @click="setUuid('00000000-0000-0000-0000-000000000000')">00000000-0000-0000-0000-000000000000</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="命名空间 DNS">
          <el-link @click="setUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')">6ba7b810-9dad-11d1-80b4-00c04fd430c8</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="命名空间 URL">
          <el-link @click="setUuid('6ba7b811-9dad-11d1-80b4-00c04fd430c8')">6ba7b811-9dad-11d1-80b4-00c04fd430c8</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="命名空间 OID">
          <el-link @click="setUuid('6ba7b812-9dad-11d1-80b4-00c04fd430c8')">6ba7b812-9dad-11d1-80b4-00c04fd430c8</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="命名空间 X500">
          <el-link @click="setUuid('6ba7b814-9dad-11d1-80b4-00c04fd430c8')">6ba7b814-9dad-11d1-80b4-00c04fd430c8</el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

const uuidVersion = ref('v4');
const uuidFormat = ref('standard');
const uuidCase = ref('lower');
const generatedUuid = ref('');
const batchCount = ref(10);
const batchUuids = ref('');
const uuidPrefix = ref('');
const uuidSuffix = ref('');
const validateUuid = ref('');
const convertInput = ref('');

// UUID 正则表达式
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuidRegexComplete = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = computed(() => {
  return uuidRegexComplete.test(validateUuid.value);
});

const uuidInfo = computed(() => {
  if (!validateUuid.value || !isValidUuid.value) return null;

  const parts = validateUuid.value.split('-');
  const version = parseInt(parts[2][0], 16);
  const variant = parseInt(parts[3][0], 16);

  const versions: Record<number, string> = {
    1: 'v1 - 时间戳',
    2: 'v2 - DCE 安全',
    3: 'v3 - MD5 命名空间',
    4: 'v4 - 随机',
    5: 'v5 - SHA-1 命名空间',
  };

  const variants: Record<number, string> = {
    8: 'DCE 1.1, ISO/IEC 11578',
    9: '保留',
    10: 'Microsoft GUID',
    11: '保留',
  };

  const info: any = {
    version: versions[version] || '未知',
    variant: `变体 ${variant} (${variants[variant] || '未知'})`,
  };

  if (version === 1) {
    // 从 v1 UUID 提取时间戳
    try {
      const timestamp = parseInt(parts[2].substring(1) + parts[3] + parts[4].substring(0, 4), 16);
      const date = new Date(timestamp + 0x01b21dd213814000);
      info.timestamp = date.toLocaleString('zh-CN');
    } catch (e) {
      // 无法解析时间戳
    }
  }

  return info;
});

const generateUuid = () => {
  let uuid = '';

  if (uuidVersion.value === 'v4') {
    // v4 - 随机 UUID
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } else {
    // v1 - 时间戳 UUID
    const now = Date.now();
    const timestamp = now + 0x01b21dd213814000;
    uuid = 'xxxxxxxx-xxxx-1xxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      if (c === 'x') {
        const r = (Math.random() * 16) | 0;
        return r.toString(16);
      } else {
        const r = ((timestamp / Math.pow(16, parseInt(c))) % 16) | 0;
        return (r & 0x3) | 0x8.toString(16);
      }
    });
  }

  // 应用格式
  generatedUuid.value = applyUuidFormat(uuid);
};

const applyUuidFormat = (uuid: string): string => {
  let result = uuid;

  switch (uuidFormat.value) {
    case 'compact':
      result = uuid.replace(/-/g, '');
      break;
    case 'braced':
      result = `{${uuid}}`;
      break;
    case 'urn':
      result = `urn:uuid:${uuid}`;
      break;
  }

  // 大小写
  if (uuidCase.value === 'upper') {
    result = result.toUpperCase();
  }

  return result;
};

const generateBatchUuid = () => {
  const uuids: string[] = [];
  for (let i = 0; i < batchCount.value; i++) {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    uuids.push(uuidPrefix.value + applyUuidFormat(uuid) + uuidSuffix.value);
  }
  batchUuids.value = uuids.join('\n');
  ElMessage.success(`已生成 ${batchCount.value} 个 UUID`);
};

const copyUuid = () => {
  if (!generatedUuid.value) return;
  navigator.clipboard.writeText(generatedUuid.value);
  ElMessage.success('已复制到剪贴板');
};

const copyAllUuid = () => {
  generateBatchUuid();
  copyBatchUuid();
};

const copyBatchUuid = () => {
  if (!batchUuids.value) return;
  navigator.clipboard.writeText(batchUuids.value);
  ElMessage.success('已复制到剪贴板');
};

const downloadUuidList = () => {
  if (!batchUuids.value) {
    ElMessage.warning('请先生成 UUID');
    return;
  }
  const blob = new Blob([batchUuids.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'uuid_list.txt';
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('下载成功');
};

const setUuid = (uuid: string) => {
  generatedUuid.value = applyUuidFormat(uuid);
  ElMessage.success('已设置');
};

const toBase64 = (uuid: string): string => {
  if (!uuid || !uuidRegex.test(uuid)) return '-';
  const hex = uuid.replace(/-/g, '');
  let binary = '';
  for (let i = 0; i < hex.length; i += 2) {
    binary += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return btoa(binary);
};

const toNumber = (uuid: string): string => {
  if (!uuid || !uuidRegex.test(uuid)) return '-';
  const hex = uuid.replace(/-/g, '');
  return BigInt('0x' + hex).toString();
};

const toIntArray = (uuid: string): string => {
  if (!uuid || !uuidRegex.test(uuid)) return '-';
  const hex = uuid.replace(/-/g, '');
  const arr: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    arr.push(parseInt(hex.substr(i, 2), 16));
  }
  return `[${arr.join(', ')}]`;
};

// 监听验证输入
watch(validateUuid, (val) => {
  if (val && !isValidUuid.value) {
    // 输入中，不做处理
  }
});

// 初始化生成一个 UUID
generateUuid();
generateBatchUuid();
</script>

<style lang="scss" scoped>
.uuid-tool {
  .UUID版本 {
    margin-bottom: 20px;
  }
  .UUID显示 {
    margin-top: 20px;
  }
  .验证结果 {
    text-align: center;
  }
  .转换结果 {
    font-family: monospace;
  }
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .mt-4 {
    margin-top: 16px;
  }
}
</style>
