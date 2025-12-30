<template>
  <div class="password-tool">
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card header="密码生成">
          <el-form label-position="top">
            <el-form-item label="密码长度">
              <el-slider v-model="passwordLength" :min="6" :max="64" show-input />
            </el-form-item>
            <el-form-item label="字符类型">
              <el-checkbox-group v-model="charTypes">
                <el-checkbox label="uppercase" value="uppercase">大写字母 (A-Z)</el-checkbox>
                <el-checkbox label="lowercase" value="lowercase">小写字母 (a-z)</el-checkbox>
                <el-checkbox label="numbers" value="numbers">数字 (0-9)</el-checkbox>
                <el-checkbox label="symbols" value="symbols">特殊字符 (!@#$%)</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="排除字符">
              <el-input v-model="excludeChars" placeholder="要排除的字符，如: i l 1 o 0" />
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="generatePassword">生成密码</el-button>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card header="生成结果">
          <div class="密码显示">
            <el-input
              v-model="generatedPassword"
              readonly
              size="large"
              :class="{ '密码强度-弱': strengthLevel === 1, '密码强度-中': strengthLevel === 2, '密码强度-强': strengthLevel === 3 }"
            />
          </div>
          <div class="强度指示">
            <el-progress
              :percentage="strengthPercentage"
              :status="strengthStatus"
              :stroke-width="10"
            />
            <span class="强度文字">强度: {{ strengthText }}</span>
          </div>
          <div class="操作区">
            <el-button type="primary" @click="copyPassword">复制密码</el-button>
            <el-button @click="generatePassword">重新生成</el-button>
          </div>
        </el-card>

        <el-card header="批量生成" class="mt-4">
          <el-form-item label="生成数量">
            <el-input-number v-model="batchCount" :min="1" :max="50" />
          </el-form-item>
          <el-button type="primary" @click="generateBatchPasswordes">生成多个密码</el-button>
          <el-input
            v-model="batchPasswords"
            type="textarea"
            :rows="5"
            readonly
            class="mt-4"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const passwordLength = ref(16);
const charTypes = ref(['uppercase', 'lowercase', 'numbers', 'symbols']);
const excludeChars = ref('');
const generatedPassword = ref('');
const batchCount = ref(5);
const batchPasswords = ref('');

const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const generatePassword = () => {
  if (charTypes.value.length === 0) {
    ElMessage.warning('请至少选择一种字符类型');
    return;
  }

  let chars = '';
  charTypes.value.forEach(type => {
    chars += charSets[type as keyof typeof charSets];
  });

  // 排除指定字符
  if (excludeChars.value) {
    excludeChars.value.split('').forEach(char => {
      chars = chars.replace(new RegExp(`\\${char}`, 'g'), '');
    });
  }

  if (chars.length === 0) {
    ElMessage.warning('没有可用字符');
    return;
  }

  let password = '';
  // 确保每种选择的类型都至少有一个字符
  charTypes.value.forEach(type => {
    password += charSets[type as keyof typeof charSets][
      Math.floor(Math.random() * charSets[type as keyof typeof charSets].length)
    ];
  });

  // 填充剩余长度
  for (let i = password.length; i < passwordLength.value; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // 打乱顺序
  generatedPassword.value = password.split('').sort(() => Math.random() - 0.5).join('');
};

const generateBatchPasswordes = () => {
  const passwords: string[] = [];
  for (let i = 0; i < batchCount.value; i++) {
    charTypes.value.forEach(type => {});
    generatePassword();
    passwords.push(generatedPassword.value);
  }
  batchPasswords.value = passwords.join('\n');
};

const copyPassword = () => {
  if (!generatedPassword.value) return;
  navigator.clipboard.writeText(generatedPassword.value);
  ElMessage.success('已复制到剪贴板');
};

const strengthLevel = computed(() => {
  if (!generatedPassword.value) return 0;
  let score = 0;

  // 长度得分
  if (generatedPassword.value.length >= 8) score += 1;
  if (generatedPassword.value.length >= 12) score += 1;
  if (generatedPassword.value.length >= 16) score += 1;

  // 字符类型得分
  if (/[A-Z]/.test(generatedPassword.value)) score += 1;
  if (/[a-z]/.test(generatedPassword.value)) score += 1;
  if (/[0-9]/.test(generatedPassword.value)) score += 1;
  if (/[^A-Za-z0-9]/.test(generatedPassword.value)) score += 1;

  if (score <= 3) return 1;
  if (score <= 5) return 2;
  return 3;
});

const strengthPercentage = computed(() => {
  if (strengthLevel.value === 0) return 0;
  if (strengthLevel.value === 1) return 33;
  if (strengthLevel.value === 2) return 66;
  return 100;
});

const strengthStatus = computed(() => {
  if (strengthLevel.value === 1) return 'exception';
  if (strengthLevel.value === 2) return 'warning';
  return 'success';
});

const strengthText = computed(() => {
  if (strengthLevel.value === 0) return '无';
  if (strengthLevel.value === 1) return '弱';
  if (strengthLevel.value === 2) return '中';
  return '强';
});
</script>

<style lang="scss" scoped>
.password-tool {
  .操作区 {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }
  .密码显示 {
    margin-bottom: 10px;
  }
  .密码强度-弱 :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }
  .密码强度-中 :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-warning) inset;
  }
  .密码强度-强 :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-success) inset;
  }
  .强度指示 {
    display: flex;
    align-items: center;
    gap: 10px;
    .强度文字 {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
  .mt-4 {
    margin-top: 16px;
  }
}
</style>
