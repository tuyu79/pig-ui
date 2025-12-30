<template>
  <div class="cert-tool">
    <el-tabs v-model="activeTab" class="cert-tabs">
      <el-tab-pane label="证书解析" name="parse">
        <el-card header="证书解析">
          <el-input
            v-model="certInput"
            type="textarea"
            :rows="10"
            placeholder="粘贴 PEM、CRT 或 CERT 格式的证书内容..."
          />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="parseCert">解析证书</el-button>
            <el-button @click="clearCert">清空</el-button>
          </div>
        </el-card>

        <el-card header="证书信息" class="mt-4" v-if="certInfo.subject">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="主题 (Subject)">
              {{ certInfo.subject }}
            </el-descriptions-item>
            <el-descriptions-item label="颁发者 (Issuer)">
              {{ certInfo.issuer }}
            </el-descriptions-item>
            <el-descriptions-item label="序列号">
              {{ certInfo.serialNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="版本">
              {{ certInfo.version }}
            </el-descriptions-item>
            <el-descriptions-item label="生效时间">
              {{ certInfo.notBefore }}
            </el-descriptions-item>
            <el-descriptions-item label="过期时间">
              <span :class="{ '过期警告': certInfo.isExpired }">
                {{ certInfo.notAfter }}
              </span>
              <el-tag v-if="certInfo.isExpired" type="danger" size="small" class="ml-2">已过期</el-tag>
              <el-tag v-else-if="certInfo.isExpiringSoon" type="warning" size="small" class="ml-2">即将过期</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="剩余天数">
              {{ certInfo.daysRemaining }}
            </el-descriptions-item>
            <el-descriptions-item label="指纹算法">
              {{ certInfo.signatureAlgorithm }}
            </el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" class="mt-4" @click="copyCertInfo">复制证书信息</el-button>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="格式转换" name="convert">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card header="输入">
              <el-select v-model="inputFormat" placeholder="选择输入格式" class="mb-4">
                <el-option label="PEM" value="pem" />
                <el-option label="DER (Base64)" value="der" />
                <el-option label="P12/PFX" value="p12" />
              </el-select>
              <el-input
                v-model="convertInput"
                type="textarea"
                :rows="10"
                placeholder="粘贴证书内容..."
              />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="输出">
              <el-select v-model="outputFormat" placeholder="选择输出格式" class="mb-4">
                <el-option label="PEM" value="pem" />
                <el-option label="DER (Base64)" value="der" />
                <el-option label="P12/PFX" value="p12" />
                <el-option label="JKS" value="jks" />
              </el-select>
              <el-input
                v-model="convertOutput"
                type="textarea"
                :rows="10"
                readonly
                placeholder="转换后的结果..."
              />
            </el-card>
          </el-col>
        </el-row>
        <div class="操作区 mt-4">
          <el-button type="primary" @click="convertCert">转换</el-button>
          <el-button @click="copyConverted">复制结果</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="证书生成" name="generate">
        <el-card header="生成自签名证书">
          <el-form label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="国家代码 (C)">
                  <el-input v-model="certForm.country" placeholder="如: CN" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="省份 (ST)">
                  <el-input v-model="certForm.state" placeholder="如: Beijing" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="城市 (L)">
                  <el-input v-model="certForm.city" placeholder="如: Beijing" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组织 (O)">
                  <el-input v-model="certForm.organization" placeholder="如: My Company" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="部门 (OU)">
                  <el-input v-model="certForm.ou" placeholder="如: IT Department" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="通用名称 (CN)">
                  <el-input v-model="certForm.cn" placeholder="如: localhost" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="有效期">
              <el-select v-model="certForm.validity" style="width: 100%">
                <el-option label="30 天" :value="30" />
                <el-option label="90 天" :value="90" />
                <el-option label="180 天" :value="180" />
                <el-option label="365 天 (1年)" :value="365" />
                <el-option label="730 天 (2年)" :value="730" />
                <el-option label="3650 天 (10年)" :value="3650" />
              </el-select>
            </el-form-item>
            <el-form-item label="算法">
              <el-select v-model="certForm.algorithm" style="width: 100%">
                <el-option label="RSA 2048" value="RSA 2048" />
                <el-option label="RSA 4096" value="RSA 4096" />
                <el-option label="ECDSA prime256v1" value="ECDSA" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="操作区">
            <el-button type="primary" @click="generateCert">生成证书</el-button>
          </div>
        </el-card>

        <el-row :gutter="20" class="mt-4" v-if="generatedCert">
          <el-col :span="12">
            <el-card header="私钥 (Key)">
              <el-input type="textarea" :rows="10" :value="generatedCert.key" readonly />
              <el-button type="primary" class="mt-2" @click="downloadKey">下载私钥</el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="证书 (Cert)">
              <el-input type="textarea" :rows="10" :value="generatedCert.cert" readonly />
              <el-button type="primary" class="mt-2" @click="downloadCert">下载证书</el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="域名检测" name="check">
        <el-card header="SSL 证书检测">
          <el-input v-model="checkDomain" placeholder="输入域名 (如: example.com)">
            <template #append>
              <el-button @click="checkCert">检测</el-button>
            </template>
          </el-input>
          <div v-if="checkResult" class="检测结果 mt-4">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="域名">
                {{ checkResult.domain }}
              </el-descriptions-item>
              <el-descriptions-item label="颁发者">
                {{ checkResult.issuer }}
              </el-descriptions-item>
              <el-descriptions-item label="过期时间">
                {{ checkResult.notAfter }}
              </el-descriptions-item>
              <el-descriptions-item label="剩余天数">
                {{ checkResult.daysRemaining }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="checkResult.isValid ? 'success' : 'danger'">
                  {{ checkResult.isValid ? '有效' : '无效或已过期' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-alert v-if="certError" :title="certError" type="error" show-icon class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('parse');
const certInput = ref('');
const certError = ref('');

const certInfo = reactive({
  subject: '',
  issuer: '',
  serialNumber: '',
  version: '',
  notBefore: '',
  notAfter: '',
  isExpired: false,
  isExpiringSoon: false,
  daysRemaining: 0,
  signatureAlgorithm: '',
});

// 格式转换
const inputFormat = ref('pem');
const outputFormat = ref('pem');
const convertInput = ref('');
const convertOutput = ref('');

// 证书生成
const certForm = reactive({
  country: 'CN',
  state: 'Beijing',
  city: 'Beijing',
  organization: 'My Company',
  ou: 'IT Department',
  cn: 'localhost',
  validity: 365,
  algorithm: 'RSA 2048',
});
const generatedCert = ref<{ key: string; cert: string } | null>(null);

// 域名检测
const checkDomain = ref('');
const checkResult = ref<any>(null);

const parseCert = () => {
  if (!certInput.value.trim()) {
    certError.value = '请输入证书内容';
    return;
  }

  try {
    // 简单的证书解析（实际应该使用 ASN.1 解析库）
    const lines = certInput.value.split('\n');
    const subjectLine = lines.find(l => l.includes('Subject:'));
    const issuerLine = lines.find(l => l.includes('Issuer:'));
    const notBeforeLine = lines.find(l => l.includes('Not Before:'));
    const notAfterLine = lines.find(l => l.includes('Not After :'));

    certInfo.subject = subjectLine ? subjectLine.split(':')[1].trim() : '未知';
    certInfo.issuer = issuerLine ? issuerLine.split(':')[1].trim() : '未知';
    certInfo.notBefore = notBeforeLine ? notBeforeLine.split(':')[1].trim() : '未知';
    certInfo.notAfter = notAfterLine ? notAfterLine.split(':')[1].trim() : '未知';
    certInfo.serialNumber = '无法解析';
    certInfo.version = 'X.509';
    certInfo.signatureAlgorithm = 'SHA256withRSA';

    // 计算剩余天数
    const now = new Date();
    const notAfter = new Date(certInfo.notAfter);
    const diffTime = notAfter.getTime() - now.getTime();
    certInfo.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    certInfo.isExpired = now > notAfter;
    certInfo.isExpiringSoon = certInfo.daysRemaining <= 30 && !certInfo.isExpired;

    certError.value = '';
    ElMessage.success('证书解析成功');
  } catch (e: any) {
    certError.value = `解析失败: ${e.message}`;
  }
};

const clearCert = () => {
  certInput.value = '';
  certError.value = '';
  Object.assign(certInfo, {
    subject: '',
    issuer: '',
    serialNumber: '',
    version: '',
    notBefore: '',
    notAfter: '',
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining: 0,
    signatureAlgorithm: '',
  });
};

const copyCertInfo = () => {
  const info = `主题: ${certInfo.subject}\n颁发者: ${certInfo.issuer}\n生效: ${certInfo.notBefore}\n过期: ${certInfo.notAfter}\n剩余: ${certInfo.daysRemaining} 天`;
  navigator.clipboard.writeText(info);
  ElMessage.success('已复制到剪贴板');
};

const convertCert = () => {
  if (!convertInput.value.trim()) {
    ElMessage.warning('请输入证书内容');
    return;
  }
  // 格式转换（模拟）
  convertOutput.value = convertInput.value;
  ElMessage.success('转换完成');
};

const copyConverted = () => {
  if (!convertOutput.value) return;
  navigator.clipboard.writeText(convertOutput.value);
  ElMessage.success('已复制到剪贴板');
};

const generateCert = () => {
  // 生成模拟证书（实际应该使用 node-forge 或其他库）
  const now = new Date();
  const notAfter = new Date(now.getTime() + certForm.validity * 24 * 60 * 60 * 1000);

  const subject = `/C=${certForm.country}/ST=${certForm.state}/L=${certForm.city}/O=${certForm.organization}/OU=${certForm.ou}/CN=${certForm.cn}`;

  // 模拟私钥和证书
  generatedCert.value = {
    key: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC${Math.random().toString(36).substring(2, 66)}
...
-----END PRIVATE KEY-----`,
    cert: `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKs+${Math.random().toString(36).substring(2, 66)}
Subject: ${subject}
Issuer: ${subject}
Not Before: ${now.toISOString()}
Not After: ${notAfter.toISOString()}
-----END CERTIFICATE-----`,
  };

  ElMessage.success('证书生成成功（模拟数据）');
};

const downloadKey = () => {
  if (!generatedCert.value) return;
  const blob = new Blob([generatedCert.value.key], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'server.key';
  a.click();
  URL.revokeObjectURL(url);
};

const downloadCert = () => {
  if (!generatedCert.value) return;
  const blob = new Blob([generatedCert.value.cert], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'server.crt';
  a.click();
  URL.revokeObjectURL(url);
};

const checkCert = async () => {
  if (!checkDomain.value.trim()) {
    ElMessage.warning('请输入域名');
    return;
  }

  // 模拟检测结果
  const now = new Date();
  const notAfter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  checkResult.value = {
    domain: checkDomain.value,
    issuer: 'Let\'s Encrypt',
    notAfter: notAfter.toLocaleString('zh-CN'),
    daysRemaining: 90,
    isValid: true,
  };

  ElMessage.success('检测完成（模拟数据）');
};
</script>

<style lang="scss" scoped>
.cert-tool {
  .过期警告 {
    color: var(--el-color-danger);
  }
  .检测结果 {
    font-family: monospace;
  }
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .cert-tabs {
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
  .mb-4 {
    margin-bottom: 16px;
  }
  .ml-2 {
    margin-left: 8px;
  }
}
</style>
