let stopSheet; // 儲存角色一的待機精靈圖。
let walkSheet; // 儲存角色一的走路精靈圖。
let magicSheet; // 儲存角色一施放魔法時使用的精靈圖。
let effectSheet; // 儲存魔法飛行特效使用的精靈圖。
let characterX = 0; // 記錄角色中心在畫布上的水平位置。
let movementDirection = 0; // 記錄移動方向，向左為負、向右為正。
let facingLeft = false; // 記錄角色是否需要朝左翻轉顯示。
let isWalking = false; // 記錄是否已切換到走路動畫。
let isCasting = false; // 記錄角色是否正在播放一次性施法動畫。
let castStartFrame = 0; // 記錄施法動畫開始時的繪圖影格。
let spacePressed = false; // 避免按住空白鍵時重複觸發施法。
let activeEffects = []; // 儲存目前畫面中仍在飛行的魔法特效。
const stopFrameCount = 8; // 設定待機精靈圖的影格數量。
const walkFrameCount = 12; // 設定走路精靈圖的影格數量。
const magicFrameCount = 4; // 設定施法精靈圖的影格數量。
const effectFrameCount = 4; // 設定魔法特效精靈圖的影格數量。
const moveSpeed = 16; // 大幅提高角色每個繪圖影格的移動距離，讓走路速度更快。
const magicFrameDelay = 2; // 設定施法動畫每隔幾個繪圖影格切換一次。
const effectFrameDelay = 2; // 設定特效動畫每隔幾個繪圖影格切換一次。
const effectSpeed = 18; // 設定魔法特效每個繪圖影格的移動距離。
function preload() { // 在畫布建立前載入角色動畫精靈圖。
  stopSheet = loadImage('1/stop/stop.png'); // 載入角色一的待機精靈圖。
  walkSheet = loadImage('1/walk/walk.png'); // 載入角色一的走路精靈圖。
  magicSheet = loadImage('1/magic1/magic1.png'); // 載入角色一的一次性施法精靈圖。
  effectSheet = loadImage('1/magic1_effect/magic1_effect.png'); // 載入施法後飛行的特效精靈圖。
} // 結束載入資源函式。
function setup() { // 設定全螢幕畫布與動畫播放速度。
  createCanvas(windowWidth, windowHeight); // 依照目前視窗尺寸建立畫布。
  characterX = width * 2 / 3; // 將角色初始位置放在畫布水平三分之二處。
  frameRate(12); // 設定每秒繪圖影格數，控制動畫與移動速度。
} // 結束畫布初始化函式。
function draw() { // 每個動畫影格都執行一次繪圖與位置更新。
  background(135, 206, 235); // 使用天空藍填滿整個畫布背景。
  const characterSheet = isWalking ? walkSheet : stopSheet; // 依角色移動狀態選擇待機或走路精靈圖。
  const characterFrameCount = isWalking ? walkFrameCount : stopFrameCount; // 取得目前角色精靈圖的影格數量。
  const characterFrameWidth = characterSheet.width / characterFrameCount; // 計算角色單格影格的來源寬度。
  const characterAspectRatio = characterFrameWidth / characterSheet.height; // 計算角色單格影格的原始寬高比例。
  const desiredHeight = height / 3; // 將角色目標高度設定為畫布高度的三分之一。
  const characterDisplayWidth = min(desiredHeight * characterAspectRatio, width); // 按比例縮放角色並避免超出畫布寬度。
  const characterDisplayHeight = characterDisplayWidth / characterAspectRatio; // 依比例計算角色實際顯示高度。
  const magicFrameWidth = magicSheet.width / magicFrameCount; // 計算施法精靈圖單格影格的來源寬度。
  const magicAspectRatio = magicFrameWidth / magicSheet.height; // 計算施法影格的原始寬高比例。
  const magicDisplayHeight = min(desiredHeight, width * 2 / 3 / magicAspectRatio); // 依畫布尺寸調整施法動畫高度。
  const magicDisplayWidth = magicDisplayHeight * magicAspectRatio; // 依原圖比例計算施法動畫寬度。
  const effectFrameWidth = effectSheet.width / effectFrameCount; // 計算特效精靈圖單格影格的來源寬度。
  const effectAspectRatio = effectFrameWidth / effectSheet.height; // 計算特效影格的原始寬高比例。
  const effectDisplayHeight = min(height / 6, width / 3); // 依畫布尺寸調整飛行特效的顯示高度。
  const effectDisplayWidth = effectDisplayHeight * effectAspectRatio; // 依原圖比例計算飛行特效的顯示寬度。
  const boundsWidth = isCasting ? magicDisplayWidth : characterDisplayWidth; // 施法時依施法圖的寬度計算畫布邊界。
  const leftLimit = boundsWidth / 2; // 設定角色中心最左側位置，確保目前圖像不出界。
  const rightLimit = width - boundsWidth / 2; // 設定角色中心最右側位置，確保目前圖像不出界。
  characterX = constrain(characterX, leftLimit, rightLimit); // 尺寸改變時也將角色限制在畫布內。
  if (movementDirection !== 0 && (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW))) { // 只有按住左右方向鍵時才更新角色水平位置。
    characterX = constrain(characterX + movementDirection * moveSpeed, leftLimit, rightLimit); // 依指令方向移動並限制在畫布邊界。
    if ((movementDirection < 0 && characterX <= leftLimit) || (movementDirection > 0 && characterX >= rightLimit)) { // 判斷角色是否已抵達移動方向的邊界。
      movementDirection = 0; // 抵達畫布邊界後停止移動，動畫仍會繼續播放。
    } // 結束邊界停止判斷。
  } // 結束角色位置更新。
  const castFrameIndex = isCasting ? floor((frameCount - castStartFrame) / magicFrameDelay) : 0; // 計算施法動畫目前播放到的影格。
  if (isCasting && castFrameIndex >= magicFrameCount) { // 施法動畫播放完畢時建立飛行特效。
    const effectDirection = facingLeft ? -1 : 1; // 依角色朝向決定特效飛行方向。
    activeEffects.push({ x: characterX + effectDirection * characterDisplayWidth / 2, y: height - characterDisplayHeight * 0.55, direction: effectDirection }); // 從角色面向的一側發射特效。
    isCasting = false; // 施法動畫結束後恢復角色原本的待機或走路狀態。
  } // 結束施法完成處理。
  if (isCasting) { // 施法期間顯示一次性的施法動畫。
    const magicIndex = min(castFrameIndex, magicFrameCount - 1); // 限制目前施法影格在有效範圍內。
    const magicSourceX = magicIndex * magicFrameWidth; // 計算目前施法影格在精靈圖中的水平位置。
    push(); // 暫存畫布狀態以便依角色朝向翻轉施法圖。
    translate(characterX, height - magicDisplayHeight); // 將施法圖放在角色所在位置並貼齊畫布底端。
    if (facingLeft) { // 角色面向左側時翻轉施法動畫。
      scale(-1, 1); // 水平翻轉施法精靈圖。
    } // 結束施法圖轉向處理。
    image(magicSheet, -magicDisplayWidth / 2, 0, magicDisplayWidth, magicDisplayHeight, magicSourceX, 0, magicFrameWidth, magicSheet.height); // 依比例繪製目前施法影格。
    pop(); // 還原畫布狀態。
  } else { // 非施法期間顯示待機或走路動畫。
    const frameDelay = isWalking ? 1 : 6; // 走路時每影格切換一次，待機時維持較慢速度。
    const frameIndex = floor(frameCount / frameDelay) % characterFrameCount; // 依影格數循環播放角色精靈動畫。
    const sourceX = frameIndex * characterFrameWidth; // 計算角色影格在精靈圖中的水平位置。
    push(); // 暫存畫布狀態以便只翻轉角色圖像。
    translate(characterX, height - characterDisplayHeight); // 將繪圖原點移至角色中心與畫布底端。
    if (facingLeft) { // 角色面向左側時翻轉角色圖像。
      scale(-1, 1); // 水平翻轉精靈圖，使角色朝左。
    } // 結束角色轉向處理。
    image(characterSheet, -characterDisplayWidth / 2, 0, characterDisplayWidth, characterDisplayHeight, sourceX, 0, characterFrameWidth, characterSheet.height); // 按比例繪製目前角色影格。
    pop(); // 還原畫布狀態，避免翻轉影響其他圖像。
  } // 結束角色動畫繪製。
  for (let index = activeEffects.length - 1; index >= 0; index--) { // 由後往前更新與繪製所有飛行特效。
    const effect = activeEffects[index]; // 取得目前要更新的特效物件。
    effect.x += effect.direction * effectSpeed; // 依角色朝向推進特效位置。
    if ((effect.direction > 0 && effect.x >= width) || (effect.direction < 0 && effect.x <= 0)) { // 特效抵達畫布左右端時將其移除。
      activeEffects.splice(index, 1); // 移除已抵達畫布邊緣的特效。
      continue; // 跳過已移除特效的繪製。
    } // 結束特效邊界判斷。
    const effectIndex = floor(frameCount / effectFrameDelay) % effectFrameCount; // 循環播放特效精靈圖的四個影格。
    const effectSourceX = effectIndex * effectFrameWidth; // 計算目前特效影格在精靈圖中的水平位置。
    push(); // 暫存畫布狀態以便依飛行方向翻轉特效。
    translate(effect.x, effect.y); // 將繪圖原點移至目前特效位置。
    if (effect.direction < 0) { // 特效往左飛行時翻轉圖像。
      scale(-1, 1); // 水平翻轉特效精靈圖。
    } // 結束特效轉向處理。
    image(effectSheet, -effectDisplayWidth / 2, -effectDisplayHeight / 2, effectDisplayWidth, effectDisplayHeight, effectSourceX, 0, effectFrameWidth, effectSheet.height); // 按比例繪製目前特效影格。
    pop(); // 還原畫布狀態。
  } // 結束特效更新與繪製。
} // 結束每影格繪圖函式。
function keyPressed() { // 按下左右方向鍵時啟動角色走路與移動。
  if (keyCode === 32) { // 檢查是否按下空白鍵以施放魔法。
    if (!spacePressed) { // 確保按住空白鍵不會重複觸發。
      spacePressed = true; // 記錄空白鍵已按下。
      if (!isCasting) { // 只有施法動畫未播放時才開始一次新施法。
        isCasting = true; // 切換到施法動畫。
        castStartFrame = frameCount; // 記錄施法動畫的起始影格。
      } // 結束施法啟動判斷。
    } // 結束空白鍵重複觸發判斷。
    return false; // 阻止空白鍵造成瀏覽器頁面捲動。
  } // 結束空白鍵處理。
  if (keyCode === RIGHT_ARROW) { // 檢查是否按下鍵盤右方向鍵。
    isWalking = true; // 切換至走路精靈圖並持續播放走路動畫。
    movementDirection = 1; // 設定角色向畫布右側移動。
    facingLeft = false; // 讓角色面向右側。
    return false; // 阻止方向鍵觸發瀏覽器頁面捲動。
  } // 結束右方向鍵處理。
  if (keyCode === LEFT_ARROW) { // 檢查是否按下鍵盤左方向鍵。
    isWalking = true; // 切換至走路精靈圖並持續播放走路動畫。
    movementDirection = -1; // 設定角色向畫布左側移動。
    facingLeft = true; // 讓角色面向左側。
    return false; // 阻止方向鍵觸發瀏覽器頁面捲動。
  } // 結束左方向鍵處理。
} // 結束鍵盤輸入函式。
function keyReleased() { // 放開方向鍵時停止移動並恢復待機動畫。
  if (keyCode === 32) { // 檢查空白鍵是否已放開。
    spacePressed = false; // 允許下次按空白鍵再次施法。
    return false; // 阻止空白鍵放開事件造成瀏覽器頁面捲動。
  } // 結束空白鍵放開處理。
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 只處理左右方向鍵的放開事件。
    if (keyIsDown(LEFT_ARROW)) { // 若此時仍按住左方向鍵，繼續向左走。
      isWalking = true; // 維持走路精靈圖動畫。
      movementDirection = -1; // 設定角色繼續向左移動。
      facingLeft = true; // 讓角色繼續面向左側。
    } else if (keyIsDown(RIGHT_ARROW)) { // 若此時仍按住右方向鍵，繼續向右走。
      isWalking = true; // 維持走路精靈圖動畫。
      movementDirection = 1; // 設定角色繼續向右移動。
      facingLeft = false; // 讓角色繼續面向右側。
    } else { // 左右方向鍵都放開時切回待機狀態。
      isWalking = false; // 切回待機精靈圖動畫。
      movementDirection = 0; // 停止角色水平移動。
    } // 結束方向鍵狀態判斷。
    return false; // 阻止方向鍵觸發瀏覽器頁面捲動。
  } // 結束方向鍵放開處理。
} // 結束鍵盤放開事件函式。
function windowResized() { // 視窗或載具尺寸改變時重新調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿目前視窗。
} // 結束畫布尺寸調整函式。
