<template>
  <div class="crypto-tool">
    <el-tabs v-model="activeTab" class="crypto-tabs">
      <el-tab-pane label="MD5" name="md5">
        <el-card header="MD5 加密">
          <el-input
            v-model="md5Input"
            type="textarea"
            :rows="4"
            placeholder="请输入要加密的文本"
          />
          <div class="操作区 mt-4">
            <el-button type="primary" @click="encryptMd5">加密</el-button>
            <el-button @click="copyMd5">复制</el-button>
            <el-button @click="md5Input = ''; md5Output = ''">清空</el-button>
          </div>
          <el-input
            v-model="md5Output"
            type="textarea"
            :rows="2"
            readonly
            placeholder="加密结果"
            class="mt-4"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="SHA" name="sha">
        <el-card header="SHA 加密">
          <el-input
            v-model="shaInput"
            type="textarea"
            :rows="4"
            placeholder="请输入要加密的文本"
          />
          <el-form label-position="top" class="mt-4">
            <el-form-item label="算法">
              <el-radio-group v-model="shaAlgorithm">
                <el-radio value="sha1">SHA-1</el-radio>
                <el-radio value="sha256">SHA-256</el-radio>
                <el-radio value="sha384">SHA-384</el-radio>
                <el-radio value="sha512">SHA-512</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div class="操作区">
            <el-button type="primary" @click="encryptSha">加密</el-button>
            <el-button @click="copySha">复制</el-button>
            <el-button @click="shaInput = ''; shaOutput = ''">清空</el-button>
          </div>
          <el-input
            v-model="shaOutput"
            type="textarea"
            :rows="4"
            readonly
            placeholder="加密结果"
            class="mt-4"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="AES" name="aes">
        <el-card header="AES 加密/解密">
          <el-input
            v-model="aesInput"
            type="textarea"
            :rows="4"
            placeholder="请输入要加密/解密的文本"
          />
          <el-form label-position="top" class="mt-4">
            <el-form-item label="密钥">
              <el-input v-model="aesKey" placeholder="请输入密钥（16/24/32字节）" show-password />
            </el-form-item>
            <el-form-item label="偏移量 (IV)">
              <el-input v-model="aesIv" placeholder="可选，16字节" />
            </el-form-item>
            <el-form-item label="模式">
              <el-select v-model="aesMode" style="width: 100%">
                <el-option label="CBC" value="cbc" />
                <el-option label="ECB" value="ecb" />
                <el-option label="CTR" value="ctr" />
              </el-select>
            </el-form-item>
            <el-form-item label="填充">
              <el-select v-model="aesPadding" style="width: 100%">
                <el-option label="PKCS7" value="pkcs7" />
                <el-option label="None" value="none" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="操作区">
            <el-button type="primary" @click="encryptAes">加密</el-button>
            <el-button @click="decryptAes">解密</el-button>
            <el-button @click="copyAes">复制结果</el-button>
          </div>
          <el-input
            v-model="aesOutput"
            type="textarea"
            :rows="4"
            readonly
            placeholder="处理结果"
            class="mt-4"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="RSA" name="rsa">
        <el-card header="RSA 加密/解密">
          <el-tabs v-model="rsaSubTab">
            <el-tab-pane label="生成密钥对" name="generate">
              <el-form label-position="top">
                <el-form-item label="密钥长度">
                  <el-select v-model="rsaKeySize" style="width: 100%">
                    <el-option label="1024 位" :value="1024" />
                    <el-option label="2048 位" :value="2048" />
                    <el-option label="4096 位" :value="4096" />
                  </el-select>
                </el-form-item>
              </el-form>
              <el-button type="primary" @click="generateRsaKey">生成密钥对</el-button>
              <el-row :gutter="20" class="mt-4" v-if="rsaPublicKey || rsaPrivateKey">
                <el-col :span="12">
                  <el-input type="textarea" :rows="8" :value="rsaPublicKey" readonly placeholder="公钥" />
                  <el-button type="primary" class="mt-2" @click="downloadRsaKey('public')">下载公钥</el-button>
                </el-col>
                <el-col :span="12">
                  <el-input type="textarea" :rows="8" :value="rsaPrivateKey" readonly placeholder="私钥" />
                  <el-button type="primary" class="mt-2" @click="downloadRsaKey('private')">下载私钥</el-button>
                </el-col>
              </el-row>
            </el-tab-pane>

            <el-tab-pane label="加密" name="encrypt">
              <el-form label-position="top">
                <el-form-item label="公钥">
                  <el-input type="textarea" :rows="4" v-model="rsaEncryptPubKey" placeholder="粘贴公钥" />
                </el-form-item>
                <el-form-item label="明文">
                  <el-input type="textarea" :rows="4" v-model="rsaEncryptInput" placeholder="请输入要加密的文本" />
                </el-form-item>
              </el-form>
              <el-button type="primary" @click="encryptRsa">加密</el-button>
              <el-input type="textarea" :rows="6" :value="rsaEncryptOutput" readonly placeholder="密文" class="mt-4" />
              <el-button class="mt-2" @click="copyRsaEncrypt">复制</el-button>
            </el-tab-pane>

            <el-tab-pane label="解密" name="decrypt">
              <el-form label-position="top">
                <el-form-item label="私钥">
                  <el-input type="textarea" :rows="4" v-model="rsaDecryptPriKey" placeholder="粘贴私钥" />
                </el-form-item>
                <el-form-item label="密文">
                  <el-input type="textarea" :rows="4" v-model="rsaDecryptInput" placeholder="请输入要解密的文本" />
                </el-form-item>
              </el-form>
              <el-button type="primary" @click="decryptRsa">解密</el-button>
              <el-input type="textarea" :rows="6" :value="rsaDecryptOutput" readonly placeholder="明文" class="mt-4" />
              <el-button class="mt-2" @click="copyRsaDecrypt">复制</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="哈希对比" name="hash">
        <el-card header="哈希值对比">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input
                type="textarea"
                :rows="6"
                v-model="hashInput1"
                placeholder="输入第一个文本或哈希值"
              />
            </el-col>
            <el-col :span="12">
              <el-input
                type="textarea"
                :rows="6"
                v-model="hashInput2"
                placeholder="输入第二个文本或哈希值"
              />
            </el-col>
          </el-row>
          <div class="操作区 mt-4">
            <el-button type="primary" @click="compareHashes">对比</el-button>
            <el-button @click="calculateAllHashes">计算所有哈希</el-button>
          </div>
          <div v-if="hashComparisonResult" class="对比结果 mt-4">
            <el-alert :type="hashComparisonResult.isMatch ? 'success' : 'warning'" :title="hashComparisonResult.message" show-icon />
            <el-table :data="hashComparisonResult.hashes" class="mt-4" size="small">
              <el-table-column prop="algorithm" label="算法" width="100" />
              <el-table-column prop="hash1" label="哈希值 1" />
              <el-table-column prop="hash2" label="哈希值 2" />
              <el-table-column prop="isMatch" label="是否匹配" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.isMatch ? 'success' : 'danger'">
                    {{ row.isMatch ? '匹配' : '不匹配' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
// 引入 crypto-js
import CryptoJS from 'crypto-js';

const activeTab = ref('md5');
const md5Input = ref('');
const md5Output = ref('');

const shaInput = ref('');
const shaOutput = ref('');
const shaAlgorithm = ref('sha256');

const aesInput = ref('');
const aesOutput = ref('');
const aesKey = ref('');
const aesIv = ref('');
const aesMode = ref('cbc');
const aesPadding = ref('pkcs7');

const rsaSubTab = ref('generate');
const rsaKeySize = ref(2048);
const rsaPublicKey = ref('');
const rsaPrivateKey = ref('');

const rsaEncryptPubKey = ref('');
const rsaEncryptInput = ref('');
const rsaEncryptOutput = ref('');

const rsaDecryptPriKey = ref('');
const rsaDecryptInput = ref('');
const rsaDecryptOutput = ref('');

const hashInput1 = ref('');
const hashInput2 = ref('');
const hashComparisonResult = ref<any>(null);

// MD5
const encryptMd5 = () => {
  if (!md5Input.value) {
    ElMessage.warning('请输入文本');
    return;
  }
  md5Output.value = CryptoJS.MD5(md5Input.value).toString();
  ElMessage.success('加密完成');
};

const copyMd5 = () => {
  if (!md5Output.value) return;
  navigator.clipboard.writeText(md5Output.value);
  ElMessage.success('已复制到剪贴板');
};

// SHA
const encryptSha = () => {
  if (!shaInput.value) {
    ElMessage.warning('请输入文本');
    return;
  }

  let result = '';
  switch (shaAlgorithm.value) {
    case 'sha1':
      result = CryptoJS.SHA1(shaInput.value).toString();
      break;
    case 'sha256':
      result = CryptoJS.SHA256(shaInput.value).toString();
      break;
    case 'sha384':
      result = CryptoJS.SHA384(shaInput.value).toString();
      break;
    case 'sha512':
      result = CryptoJS.SHA512(shaInput.value).toString();
      break;
  }
  shaOutput.value = result;
  ElMessage.success('加密完成');
};

const copySha = () => {
  if (!shaOutput.value) return;
  navigator.clipboard.writeText(shaOutput.value);
  ElMessage.success('已复制到剪贴板');
};

// AES
const encryptAes = () => {
  if (!aesInput.value) {
    ElMessage.warning('请输入文本');
    return;
  }
  if (!aesKey.value) {
    ElMessage.warning('请输入密钥');
    return;
  }

  try {
    const key = CryptoJS.enc.Utf8.parse(aesKey.value);
    const iv = aesIv.value ? CryptoJS.enc.Utf8.parse(aesIv.value) : undefined;

    let result: any;
    if (aesMode.value === 'cbc') {
      result = CryptoJS.AES.encrypt(aesInput.value, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: aesPadding.value === 'pkcs7' ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.NoPadding,
      });
    } else if (aesMode.value === 'ecb') {
      result = CryptoJS.AES.encrypt(aesInput.value, key, {
        mode: CryptoJS.mode.ECB,
        padding: aesPadding.value === 'pkcs7' ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.NoPadding,
      });
    } else {
      result = CryptoJS.AES.encrypt(aesInput.value, key, {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: aesPadding.value === 'pkcs7' ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.NoPadding,
      });
    }

    aesOutput.value = result.toString();
    ElMessage.success('加密完成');
  } catch (e: any) {
    ElMessage.error(`加密失败: ${e.message}`);
  }
};

const decryptAes = () => {
  if (!aesOutput.value) {
    ElMessage.warning('请先加密或输入密文');
    return;
  }
  if (!aesKey.value) {
    ElMessage.warning('请输入密钥');
    return;
  }

  try {
    const key = CryptoJS.enc.Utf8.parse(aesKey.value);
    const iv = aesIv.value ? CryptoJS.enc.Utf8.parse(aesIv.value) : undefined;

    let result: any;
    if (aesMode.value === 'cbc') {
      result = CryptoJS.AES.decrypt(aesOutput.value, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: aesPadding.value === 'pkcs7' ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.NoPadding,
      });
    } else if (aesMode.value === 'ecb') {
      result = CryptoJS.AES.decrypt(aesOutput.value, key, {
        mode: CryptoJS.mode.ECB,
        padding: aesPadding.value === 'pkcs7' ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.NoPadding,
      });
    } else {
      result = CryptoJS.AES.decrypt(aesOutput.value, key, {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: aesPadding.value === 'pkcs7' ? CryptoJS.pad.Pkcs7 : CryptoJS.pad.NoPadding,
      });
    }

    aesOutput.value = result.toString(CryptoJS.enc.Utf8);
    ElMessage.success('解密完成');
  } catch (e: any) {
    ElMessage.error(`解密失败: ${e.message}`);
  }
};

const copyAes = () => {
  if (!aesOutput.value) return;
  navigator.clipboard.writeText(aesOutput.value);
  ElMessage.success('已复制到剪贴板');
};

// RSA
const generateRsaKey = () => {
  // 注意：浏览器端生成 RSA 密钥对需要较长时间
  ElMessage.info('正在生成密钥对...');

  // 使用 Web Crypto API 生成 RSA 密钥
  window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: rsaKeySize.value,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  ).then((keyPair) => {
    // 导出公钥
    window.crypto.subtle.exportKey('spki', keyPair.publicKey).then((exported) => {
      rsaPublicKey.value = arrayBufferToBase64(exported);
    });

    // 导出私钥
    window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey).then((exported) => {
      rsaPrivateKey.value = arrayBufferToBase64(exported);
    });

    ElMessage.success('密钥对生成成功');
  }).catch((e) => {
    ElMessage.error(`生成失败: ${e.message}`);
  });
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const downloadRsaKey = (type: string) => {
  const content = type === 'public' ? rsaPublicKey.value : rsaPrivateKey.value;
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsa_${type}_key.pem`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('下载成功');
};

const encryptRsa = () => {
  if (!rsaEncryptPubKey.value || !rsaEncryptInput.value) {
    ElMessage.warning('请输入公钥和明文');
    return;
  }
  ElMessage.info('RSA 加密需要后端支持');
  rsaEncryptOutput.value = '[需要服务端加密]';
};

const decryptRsa = () => {
  if (!rsaDecryptPriKey.value || !rsaDecryptInput.value) {
    ElMessage.warning('请输入私钥和密文');
    return;
  }
  ElMessage.info('RSA 解密需要后端支持');
  rsaDecryptOutput.value = '[需要服务端解密]';
};

const copyRsaEncrypt = () => {
  if (!rsaEncryptOutput.value) return;
  navigator.clipboard.writeText(rsaEncryptOutput.value);
  ElMessage.success('已复制');
};

const copyRsaDecrypt = () => {
  if (!rsaDecryptOutput.value) return;
  navigator.clipboard.writeText(rsaDecryptOutput.value);
  ElMessage.success('已复制');
};

// 哈希对比
const compareHashes = () => {
  if (!hashInput1.value || !hashInput2.value) {
    ElMessage.warning('请输入两个文本进行对比');
    return;
  }

  const algorithms = ['MD5', 'SHA1', 'SHA256'];
  const hashes: any[] = [];

  algorithms.forEach(alg => {
    let hash1: string, hash2: string;

    switch (alg) {
      case 'MD5':
        hash1 = CryptoJS.MD5(hashInput1.value).toString();
        hash2 = CryptoJS.MD5(hashInput2.value).toString();
        break;
      case 'SHA1':
        hash1 = CryptoJS.SHA1(hashInput1.value).toString();
        hash2 = CryptoJS.SHA1(hashInput2.value).toString();
        break;
      case 'SHA256':
        hash1 = CryptoJS.SHA256(hashInput1.value).toString();
        hash2 = CryptoJS.SHA256(hashInput2.value).toString();
        break;
    }

    hashes.push({
      algorithm: alg,
      hash1: hash1.substring(0, 32) + '...',
      hash2: hash2.substring(0, 32) + '...',
      isMatch: hash1 === hash2,
    });
  });

  const allMatch = hashes.every(h => h.isMatch);
  hashComparisonResult.value = {
    isMatch: allMatch,
    message: allMatch ? '两个文本完全相同' : '两个文本不同',
    hashes,
  };
};

const calculateAllHashes = () => {
  if (!hashInput1.value) {
    ElMessage.warning('请输入文本');
    return;
  }

  const hashes: any[] = [
    { algorithm: 'MD5', hash: CryptoJS.MD5(hashInput1.value).toString(), isMatch: true },
    { algorithm: 'SHA1', hash: CryptoJS.SHA1(hashInput1.value).toString(), isMatch: true },
    { algorithm: 'SHA256', hash: CryptoJS.SHA256(hashInput1.value).toString(), isMatch: true },
    { algorithm: 'SHA384', hash: CryptoJS.SHA384(hashInput1.value).toString(), isMatch: true },
    { algorithm: 'SHA512', hash: CryptoJS.SHA512(hashInput1.value).toString(), isMatch: true },
  ];

  hashComparisonResult.value = {
    isMatch: true,
    message: '计算完成',
    hashes: hashes.map(h => ({
      algorithm: h.algorithm,
      hash1: h.hash,
      hash2: '-',
      isMatch: true,
    })),
  };
};
</script>

<style lang="scss" scoped>
.crypto-tool {
  .操作区 {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .crypto-tabs {
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
