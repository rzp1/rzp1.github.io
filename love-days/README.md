# Love Days 页面 (舞蹈增强版)

大鹏子 ❤ 大灵子 的在一起时间记录。

访问：
```
https://rzp1.github.io/love-days/
```

## 新增舞蹈元素
- 抽象舞者剪影（SVG 曲线，不俗套，淡雅渐变 + 浮动）
- 丝带流光 (Canvas 多段贝塞尔曲线缓慢流动 + HSL 渐变)
- 扩展粒子：❤ / </> / 舞 / 扇 / 纱
- “舞感” 按钮可一键关闭舞蹈增强元素（隐藏舞者 + 丝带）

## 自定义入口
`index.html` 顶部：
```html
<html lang="zh-CN" data-start="2025-10-07" data-dance="on">
```
- `data-start` 修改起始日期
- `data-dance="off"` 默认关闭舞感

## 主要文件
```
love-days/
  index.html   # 页面入口 + 舞者SVG + 按钮
  style.css    # 星空背景, 玻璃拟态, 丝带层样式, 舞者动画
  script.js    # 计时, 星空, 丝带, 粒子, 音乐, 开关
  README.md    # 说明
```

## 粒子 / 丝带数量调节
`script.js` 中：
```js
const PARTICLE_BASE = 42;      // 粒子基数
const STAR_COUNT_BASE = 140;   // 星星数
const RIBBON_COUNT = 5;        // 丝带数量
```

减小这些数值可提升性能。

## 添加/修改粒子字符
在 `symbols` 数组中新增：
```js
{ t:'莲', c:'#ffd1e6', size:28 }
```

## JS 对外调试接口
浏览器控制台可调用：
```js
_LoveDays.setStart('2025-10-07')
_LoveDays.toggleDance(false) // or true
_LoveDays.refreshParticles()
_LoveDays.refreshRibbons()
```

## 兼容与性能
- 绘制节流：约 30fps，手机功耗更低
- 页面隐藏暂停时间更新 animation loop
- `prefers-reduced-motion` 自动关闭特效

## 下一步可选想法
- 点击丝带生成短暂光点
- 按天数解锁不同舞姿（替换 SVG path）
- 加入照片淡入画廊（舞者背后）
- 生成分享卡片（Canvas 合成）

需要继续增强随时告诉我。
