<template>
  <div class="solitaire">
    <div class="game-header">
      <h2>纸牌游戏 (Klondike)</h2>
      <div class="game-stats">
        <span>步数: {{ moves }}</span>
        <span>时间: {{ timeDisplay }}</span>
      </div>
      <div class="game-actions">
        <el-button type="primary" @click="newGame">新游戏</el-button>
        <el-button @click="undo" :disabled="history.length === 0">撤销</el-button>
      </div>
    </div>

    <div class="game-board">
      <!-- 顶部区域：牌堆和回收站 -->
      <div class="top-row">
        <div class="stock-waste">
          <div class="card-placeholder stock" @click="drawCard">
            <div v-if="stock.length > 0" class="card card-back">
              <span class="card-count">{{ stock.length }}</span>
            </div>
            <div v-else class="empty-placeholder">
              <el-icon><Refresh /></el-icon>
            </div>
          </div>
          <div class="card-placeholder waste">
            <div v-if="waste.length > 0" class="card" :class="getCardClass(waste[waste.length - 1])" @click="selectCard(waste[waste.length - 1], 'waste')">
              <span class="card-value">{{ getCardValue(waste[waste.length - 1]) }}</span>
              <span class="card-suit">{{ getCardSuit(waste[waste.length - 1]) }}</span>
            </div>
          </div>
        </div>

        <div class="foundations">
          <div v-for="(pile, index) in foundations" :key="index" class="card-placeholder foundation" @click="moveToFoundation(index)">
            <div v-if="pile.length > 0" class="card" :class="getCardClass(pile[pile.length - 1])">
              <span class="card-value">{{ getCardValue(pile[pile.length - 1]) }}</span>
              <span class="card-suit">{{ getCardSuit(pile[pile.length - 1]) }}</span>
            </div>
            <div v-else class="foundation-base">
              <span>{{ ['A', '2', '3', '4'][index] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 牌面区域 -->
      <div class="tableau">
        <div v-for="(pile, index) in tableau" :key="index" class="tableau-pile" @click="selectPile(index)">
          <div
            v-for="(card, cardIndex) in pile"
            :key="card.id"
            class="card tableau-card"
            :class="[
              getCardClass(card),
              { 'selected': selectedCard && selectedCard.pile === index && selectedCard.index === cardIndex },
              { 'face-down': !card.faceUp }
            ]"
            :style="{ top: cardIndex * 30 + 'px' }"
            @click.stop="selectTableauCard(index, cardIndex)"
          >
            <template v-if="card.faceUp">
              <span class="card-value">{{ getCardValue(card) }}</span>
              <span class="card-suit">{{ getCardSuit(card) }}</span>
            </template>
          </div>
          <div v-if="pile.length === 0" class="empty-tableau"></div>
        </div>
      </div>
    </div>

    <!-- 胜利弹窗 -->
    <el-dialog v-model="showWinDialog" title="恭喜你赢了!" width="300px" center>
      <div class="win-content">
        <p>总步数: {{ moves }}</p>
        <p>用时: {{ timeDisplay }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="newGame">再玩一局</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

// 牌的花色和点数
const SUITS = ['♠', '♥', '♣', '♦'];
const COLORS = { '♠': 'black', '♥': 'red', '♣': 'black', '♦': 'red' };
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  id: string;
  suit: string;
  value: number;
  faceUp: boolean;
}

interface SelectedCard {
  pile: string;
  index: number;
  cards: Card[];
  pileIndex?: number;
}

// 游戏状态
const stock = ref<Card[]>([]);
const waste = ref<Card[]>([]);
const foundations = ref<Card[][]>([[], [], [], []]);
const tableau = ref<Card[][]>([[], [], [], [], [], [], []]);
const selectedCard = ref<SelectedCard | null>(null);
const moves = ref(0);
const history = ref<any[]>([]);
const showWinDialog = ref(false);
const gameTime = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

// 时间显示
const timeDisplay = computed(() => {
  const minutes = Math.floor(gameTime.value / 60);
  const seconds = gameTime.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 创建一副牌
const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        id: `card-${id++}`,
        suit,
        value,
        faceUp: false,
      });
    }
  }
  return deck;
};

// 洗牌
const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 发牌
const dealCards = () => {
  const deck = shuffle(createDeck());
  stock.value = [];
  waste.value = [];
  foundations.value = [[], [], [], []];
  tableau.value = [[], [], [], [], [], [], []];

  // 发到牌面区域
  let cardIndex = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      const card = deck[cardIndex++];
      card.faceUp = i === j; // 最后一张翻开
      tableau.value[j].push(card);
    }
  }

  // 剩余的放入牌堆
  stock.value = deck.slice(cardIndex);
};

// 获取牌的样式类
const getCardClass = (card: Card) => {
  return {
    'red': COLORS[card.suit as keyof typeof COLORS] === 'red',
    'black': COLORS[card.suit as keyof typeof COLORS] === 'black',
    'red-suit': card.suit === '♥' || card.suit === '♦',
  };
};

// 获取牌的显示值
const getCardValue = (card: Card) => {
  return VALUES[card.value - 1];
};

// 获取花色图标
const getCardSuit = (card: Card) => {
  return card.suit;
};

// 保存历史记录（用于撤销）
const saveHistory = () => {
  history.value.push({
    stock: JSON.parse(JSON.stringify(stock.value)),
    waste: JSON.parse(JSON.stringify(waste.value)),
    foundations: JSON.parse(JSON.stringify(foundations.value)),
    tableau: JSON.parse(JSON.stringify(tableau.value)),
    moves: moves.value,
  });
};

// 抽牌
const drawCard = () => {
  saveHistory();
  if (stock.value.length > 0) {
    const card = stock.value.pop()!;
    card.faceUp = true;
    waste.value.push(card);
    moves.value++;
    selectedCard.value = null;
  } else {
    // 牌堆为空，重置
    while (waste.value.length > 0) {
      const card = waste.value.pop()!;
      card.faceUp = false;
      stock.value.unshift(card);
    }
    moves.value++;
    selectedCard.value = null;
    ElMessage.info('牌堆已重置');
  }
};

// 选择牌
const selectCard = (card: Card, pile: string) => {
  if (selectedCard.value) {
    // 尝试移动已选择的牌
    if (tryMoveCard(pile)) {
      moves.value++;
      checkWin();
    }
    selectedCard.value = null;
  }
};

// 选择牌面区域的牌
const selectTableauCard = (pileIndex: number, cardIndex: number) => {
  const pile = tableau.value[pileIndex];
  const card = pile[cardIndex];

  if (!card.faceUp) {
    // 如果点击的是背面，翻开
    if (cardIndex === pile.length - 1) {
      saveHistory();
      card.faceUp = true;
      moves.value++;
    }
    return;
  }

  if (selectedCard.value) {
    // 尝试移动
    if (selectedCard.value.pile === 'tableau' && selectedCard.value.pileIndex === pileIndex) {
      // 同一堆，不处理
      return;
    }
    if (tryMoveToTableau(pileIndex)) {
      moves.value++;
      // 翻开原来堆顶的牌
      if (selectedCard.value.pile === 'tableau') {
        const oldPile = tableau.value[selectedCard.value.pileIndex!];
        if (oldPile.length > 0) {
          oldPile[oldPile.length - 1].faceUp = true;
        }
      }
      checkWin();
    }
    selectedCard.value = null;
  } else {
    // 选择这张牌及其下面的牌
    selectedCard.value = {
      pile: 'tableau',
      index: cardIndex,
      cards: pile.slice(cardIndex),
      pileIndex: pileIndex,
    };
  }
};

// 选择整个牌堆
const selectPile = (index: number) => {
  if (selectedCard.value && selectedCard.value.pile === 'tableau') {
    tryMoveToTableau(index);
    moves.value++;
    // 翻开原来堆顶的牌
    const oldPile = tableau.value[selectedCard.value.pileIndex!];
    if (oldPile.length > 0) {
      oldPile[oldPile.length - 1].faceUp = true;
    }
    selectedCard.value = null;
    checkWin();
  }
};

// 尝试移动牌
const tryMoveCard = (targetPile: string): boolean => {
  if (!selectedCard.value) return false;

  const sourceCards = selectedCard.value.cards;
  if (sourceCards.length === 0) return false;

  const targetCard = targetPile === 'waste' ? waste.value[waste.value.length - 1] : null;

  if (targetPile === 'waste') {
    // 只能移动一张牌到废牌堆
    if (sourceCards.length === 1) {
      waste.value.push(sourceCards[0]);
      return true;
    }
  }

  return false;
};

// 尝试移动到牌面区域
const tryMoveToTableau = (pileIndex: number): boolean => {
  if (!selectedCard.value) return false;

  const sourceCards = selectedCard.value.cards;
  if (sourceCards.length === 0) return false;

  const targetPile = tableau.value[pileIndex];
  const targetCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : null;

  if (!targetCard) {
    // 空堆，只能放 K
    if (sourceCards[0].value === 13) {
      targetPile.push(...sourceCards);
      // 移除原位置的牌
      if (selectedCard.value.pile === 'tableau') {
        const oldPile = tableau.value[selectedCard.value.pileIndex!];
        oldPile.splice(selectedCard.value.index);
      }
      return true;
    }
  } else {
    // 检查是否可以放置
    const sourceCard = sourceCards[0];
    if (COLORS[sourceCard.suit as keyof typeof COLORS] !== COLORS[targetCard.suit as keyof typeof COLORS] &&
        sourceCard.value === targetCard.value - 1) {
      targetPile.push(...sourceCards);
      // 移除原位置的牌
      if (selectedCard.value.pile === 'tableau') {
        const oldPile = tableau.value[selectedCard.value.pileIndex!];
        oldPile.splice(selectedCard.value.index);
      }
      return true;
    }
  }

  return false;
};

// 移动到回收站
const moveToFoundation = (pileIndex: number) => {
  const foundation = foundations.value[pileIndex];

  if (selectedCard.value && selectedCard.value.cards.length === 1) {
    const card = selectedCard.value.cards[0];

    if (foundation.length === 0) {
      // 空回收站，放 A
      if (card.value === 1) {
        saveHistory();
        foundation.push(card);
        removeFromSource();
        moves.value++;
        checkWin();
        return;
      }
    } else {
      const topCard = foundation[foundation.length - 1];
      // 同花色且大1
      if (card.suit === topCard.suit && card.value === topCard.value + 1) {
        saveHistory();
        foundation.push(card);
        removeFromSource();
        moves.value++;
        checkWin();
        return;
      }
    }
  }

  // 检查牌面顶部的牌
  if (waste.value.length > 0) {
    const card = waste.value[waste.value.length - 1];
    if (foundation.length === 0) {
      if (card.value === 1) {
        saveHistory();
        foundation.push(waste.value.pop()!);
        moves.value++;
        checkWin();
        return;
      }
    } else {
      const topCard = foundation[foundation.length - 1];
      if (card.suit === topCard.suit && card.value === topCard.value + 1) {
        saveHistory();
        foundation.push(waste.value.pop()!);
        moves.value++;
        checkWin();
        return;
      }
    }
  }

  // 检查牌面区域
  for (let i = 0; i < tableau.value.length; i++) {
    const pile = tableau.value[i];
    if (pile.length > 0) {
      const card = pile[pile.length - 1];
      if (foundation.length === 0) {
        if (card.value === 1) {
          saveHistory();
          foundation.push(pile.pop()!);
          moves.value++;
          checkWin();
          return;
        }
      } else {
        const topCard = foundation[foundation.length - 1];
        if (card.suit === topCard.suit && card.value === topCard.value + 1) {
          saveHistory();
          foundation.push(pile.pop()!);
          moves.value++;
          checkWin();
          return;
        }
      }
    }
  }
};

// 从源位置移除牌
const removeFromSource = () => {
  if (!selectedCard.value) return;

  if (selectedCard.value.pile === 'tableau') {
    const pile = tableau.value[selectedCard.value.pileIndex!];
    pile.splice(selectedCard.value.index);
    // 翻开新顶部的牌
    if (pile.length > 0) {
      pile[pile.length - 1].faceUp = true;
    }
  }

  selectedCard.value = null;
};

// 撤销
const undo = () => {
  if (history.value.length === 0) return;

  const state = history.value.pop()!;
  stock.value = state.stock;
  waste.value = state.waste;
  foundations.value = state.foundations;
  tableau.value = state.tableau;
  moves.value = state.moves;
  selectedCard.value = null;
};

// 检查胜利
const checkWin = () => {
  const total = foundations.value.reduce((sum, pile) => sum + pile.length, 0);
  if (total === 52) {
    showWinDialog.value = true;
    if (timer) {
      clearInterval(timer);
    }
  }
};

// 新游戏
const newGame = () => {
  showWinDialog.value = false;
  moves.value = 0;
  gameTime.value = 0;
  selectedCard.value = null;
  history.value = [];
  dealCards();

  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    gameTime.value++;
  }, 1000);
};

onMounted(() => {
  newGame();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.solitaire {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a5c38;
  padding: 20px;
  box-sizing: border-box;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #fff;
    font-size: 20px;
  }

  .game-stats {
    display: flex;
    gap: 30px;
    color: #fff;
    font-size: 16px;
  }

  .game-actions {
    display: flex;
    gap: 10px;
  }
}

.game-board {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.stock-waste {
  display: flex;
  gap: 20px;
}

.foundations {
  display: flex;
  gap: 15px;
}

.card-placeholder {
  width: 90px;
  height: 130px;
  border-radius: 8px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock {
  cursor: pointer;
}

.waste {
  border-color: rgba(255, 255, 255, 0.5);
}

.foundation-base {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.empty-placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 32px;
}

.card {
  width: 86px;
  height: 126px;
  background: #fff;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;

  &.card-back {
    background: linear-gradient(135deg, #1e3a5f 25%, transparent 25%) -18px 0,
                linear-gradient(225deg, #1e3a5f 25%, transparent 25%) -18px 0,
                linear-gradient(315deg, #1e3a5f 25%, transparent 25%),
                linear-gradient(45deg, #1e3a5f 25%, transparent 25%);
    background-size: 36px 36px;
    background-color: #2c5aa0;

    .card-count {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
  }

  &.selected {
    box-shadow: 0 0 0 3px #ffd700, 0 4px 12px rgba(255, 215, 0, 0.5);
    transform: translateY(-2px);
  }

  &.face-down {
    cursor: default;
  }

  &.red {
    color: #d32f2f;
  }

  &.black {
    color: #212121;
  }
}

.card-value {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.card-suit {
  font-size: 28px;
  align-self: flex-end;
}

.tableau {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.tableau-pile {
  width: 90px;
  position: relative;
  min-height: 200px;
}

.tableau-card {
  position: absolute;
  left: 0;
}

.empty-tableau {
  width: 86px;
  height: 126px;
  border-radius: 6px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.win-content {
  text-align: center;
  font-size: 18px;

  p {
    margin: 10px 0;
  }
}
</style>
