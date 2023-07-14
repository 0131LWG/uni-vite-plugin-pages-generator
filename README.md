## uni-vite-plugin-pages-generator

### 由来

开发的初衷是为了解决 uniapp 开发中，pages.json 文件的维护问题，当项目中页面较多时，pages.json 文件会变得很大，不方便维护，所以开发了这个插件，通过配置文件生成 pages.json 文件，方便维护。

### 功能点

1. 通过配置文件生成 pages.json 文件
2. 生成路由映射文件
3. 封装 uniapp 路由跳转方法，支持传参，使其更简洁

### 使用

1. 安装插件

```
  npm install uni-vite-plugin-pages-generator --save-dev
```

2. 配置 vite.config.js

```js
import pagesGeneratorPlugin from "vite-plugin-pages-generator";

plugins：[
  ...,
  pagesGeneratorPlugin("/src/router") // 这里是配置文件的路径
]
```

3. 配置文件目录

   ![Alt text](https://github.com/0131LWG/uni-vite-plugin-pages-generator/blob/master/README/image.png?raw=true)

   注：action 文件目录不需要创建，插件会自动生成，action 下插件会自动生成对应路由的映射文件，便于路由跳转时读取，而不需要写很长的路径

需要配置和 pages.json 文件类似如 pages：
![Alt text](https://github.com/0131LWG/uni-vite-plugin-pages-generator/blob/master/README/pages.png?raw=true)

pages 下配置的则为主包页面，同理 subPackages 则为子包，而 subPackages 下的文件名，则为子包名:

![Alt text](https://github.com/0131LWG/uni-vite-plugin-pages-generator/blob/master/README/subPackages.png?raw=true)

其他的配置方式也类似：

![Alt text](https://github.com/0131LWG/uni-vite-plugin-pages-generator/blob/master/README/easycom.png?raw=true)

1. 配置完成后运行项目，会自动生成路由映射文件和 pages.json 文件

2. 路由跳转配置封装,此代码可根据个人需求修改

```ts
/**
 * @Author GUAN
 * @Desc 简化router跳转api
 */
import { computed } from "vue"

interface RouteParams {
  [key: string]: any
}

interface BackParams {
  delta?: number
  data?: any
}

const routeStore: RouteParams = {}
let navigateLock = false // 处理快速点击多次

export const useActionRouter = () => {
  const pages = computed(() => (uni.getStorageSync("routerPages") as Record<string, string>) || {})

  const getRouteParams = (page: string): any => {
    const p = routeStore[page]
    if (!p) {
      // 在nvue文件中无法获取到数据，通过本地存储获取
      const store = uni.getStorageSync("routeStore")
      return store[page]
    }
    return p
  }

  const setRouteParams = (page: keyof typeof pages.value, params?: Record<string, any>) => {
    routeStore[page] = params
    uni.setStorageSync("routeParams", routeStore)
  }

  const navigate = (page: keyof typeof pages.value, params?: Record<string, any>): Promise<any> => {
    if (navigateLock) return Promise.reject("Multiple clicks")
    const eventName = Math.floor(Math.random() * 1000) + new Date().getTime() + "" // 生成唯一事件名
    navigateLock = true
    setRouteParams(page, params)
    uni.navigateTo({
      url: `${pages.value[page]}?eventName=${eventName}`,
      complete() {
        navigateLock = false
      }
    })

    return new Promise((resolve, reject) => {
      uni.$once(eventName, resolve)
      uni.$once(eventName, reject)
    })
  }

  const redirect = (page: keyof typeof pages.value, params?: Record<string, any>): void => {
    setRouteParams(page, params)
    uni.redirectTo({ url: pages.value[page] })
  }

  const reLaunch = (page: keyof typeof pages.value, params?: Record<string, any>): void => {
    setRouteParams(page, params)
    uni.reLaunch({ url: pages.value[page] })
  }

  const switchTab = (page: keyof typeof pages.value, params?: Record<string, any>): void => {
    setRouteParams(page, params)
    uni.switchTab({ url: pages.value[page] })
  }

  const back = ({ delta = 1, data = null }: BackParams = { delta: 1, data: null }): void => {
    const currentRoute = getCurrentPages().pop()
    // @ts-ignore
    const eventName = currentRoute?.options.eventName
    uni.$emit(eventName, data)
    uni.navigateBack({ delta })
  }

  return {
    getRouteParams,
    navigate,
    redirect,
    reLaunch,
    switchTab,
    back
  }
}

export type RouterType = typeof useActionRouter
```
