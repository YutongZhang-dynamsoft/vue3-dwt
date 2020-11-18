# 利用Composition API将Dynamic Web TWAIN进行封装

Composition API作为Vue.js 3的一个亮点功能，有效地解决了以往版本中的存在复用性不佳的问题。在这篇文章中，我们将利用Composition API对Dynamic Web TWAIN的初始化过程进行封装，以此减少日后在新项目中引入Dynamic Web TWAIN的成本，并提高可维护性。同时，我们还将利用mixin对Dynamic Web TWAIN进行封装，以此对比Composition API与mixin的优缺点。

## Option API

Vue.js 2及更早版本所采取的Option API，将数据、方法、生命周期钩子，分门别类的组织在一起。项目规模不大时，这种组织方式确实有效地降低了项目的维护成本。但是，随着组件的逻辑、功能逐渐复杂，代码量逐渐增加，开发者越来越频繁的在`data`、`methods`、`mounted`之间来回跳转，严重的影响了代码的可读性。而其中又有一些可以抽取出来单独封装的可复用逻辑。在这种场景下，对组件进行拆分与重新封装是一件很必要的事情。Vue.js 2提供了`mixins`机制，通过在组件中注册的方式，将方法、数据混入到组件中。

在以往的文章中，我们展示过如何在Vue.js中初始化Dynamic Web TWAIN。基于当时的代码逻辑，我们将其中的挂载与创建实例部分抽出来写成了mixin。

```js
// DwtMixin.js
import dwt from 'dwt'

const dwtEnv = dwt.WebTwainEnv

function unmountDwt(id) {
  return new Promise((res, rej) => {
    const delStatus = dwtEnv.DeleteDWTObject(id)
    if (delStatus) {
      res({ result: true, reason: 'unmount successfully' })
    } else {
      rej({ result: false, reason: `unmount dwt instance ${id} failed` })
    }
  })
}

function mountDwt(id, createEx) {
  return new Promise((res, rej) => {
    if (createEx) {
      const config = {
        WebTwainId: id
      }
      dwtEnv.CreateDWTObjectEx(config, res, rej)
    } else {
      dwtEnv.CreateDWTObject(id, res, rej)
    }
  })
}

const dwtMixins = {
  data () {
    return {
      dwtobj: null
    }
  },
  methods: {
    $_configDwtEnv (licenseKey, resourcePath) {
      dwtEnv.UseLocalService = true
      dwtEnv.AutoLoad = false
      dwtEnv.ProductKey = licenseKey
      dwtEnv.ResourcesPath = resourcePath
    },
    async $_loadDwt (id, createEx) {
      let { result } = await unmountDwt(id)
      if (!result) {
        return null
      }
      const dwtobj = await mountDwt(id, createEx)
      return dwtobj
    }
  }
}

export default dwtMixins
```

在组件中，我们通过注册mixin的方式，将暴露出来的数据与方法注入到组件中。

```html
<script>
// Dwt.vue
import LoadDwt from '@/mixins/DwtMixin.js'

export default {
  name: 'dwt',
  mixins: [LoadDwt],
  props: {
    license: {
      type: String,
      default: 'licenseKey'
    }
  },
  async mounted() {
    this.$_configDwtEnv(this.license, '/dwt-resources')
    this.dwtobj = await this.$_loadDwt('dwt-container', false)
  },
  data: () => ({

  }),
  methods: {
    acquireImage () { }
  }
}
</script>
```

这么一来，我们便实现了Dynamic Web TWAIN初始化流程的封装。在以后的项目中，我们便可以通过导入与注册mixin的方式完成加载流程与组件的混合。

## 问题

即使我们实现了Dynamic Web TWAIN加载流程封装复用的问题，但mixin又给我们引入了新的问题。

通过上述两个代码片段，我们可以很清楚的知道加载流程的从哪而来、存放dwt实例的变量叫什么。但在实际开发场景中，往往会引入多个mixin，很有可能会出现某个数据或者方法来源不明确的问题。

## 通过Composition API实现

为了解决Option API存在的种种问题，Vue.js 3提出了Composition API。通过组合的方法，将不同的功能逻辑拼凑在一起，组成一个组件。

Composition API用函数的方式包装数据与逻辑，通过对数据创建响应式代理的方法，实现函数导出数据的响应式管理。最重要的，Composition API通过在setup中注册，实现通过`props`或其他在`setup`中定义的参数，生成相应的数据，明确了数据的流向。

首先，我们创建一个`useDwt`的脚本文件，TypeScript或JavaScript均可。在这里，我们使用TypeScript。

我们先实现DWT的挂载、删除与创建方法：`_unmountDwt`、`_mountDwt`、`_createDWTObj`。它们都是常规函数，不需要暴露在文件之外。

```typescript
interface DWTInitResult {
    status: boolean;
    reason: string;
}

function _unmountDwt(id: string): Promise<DWTInitResult> {
    const env: WebTwainEnv = dwt.WebTwainEnv
    return new Promise<DWTInitResult>((res, rej) => {
        const status: boolean = env.DeleteDWTObject(id)
        if (status) {
            res({ status: true, reason: '' })
        } else {
            rej({ status: false, reason: 'Unmount dwt instance failed' })
        }
    })
}
```

```ts
async function _mountDwt(license: string, id: string,
                         resourcePath: string): Promise<DWTInitResult> {
    const unMountResult: DWTInitResult = await _unmountDwt(id)
    return new Promise<DWTInitResult>((res, rej) => {
        if (!unMountResult.status) {
            console.error(unMountResult)
            rej(unMountResult)
        }
        if (!license) {
            console.error('mounted failed due to no license key')
            rej({ status: false, reason: 'license key should not be empty' })
        }
        const env: WebTwainEnv = dwt.WebTwainEnv
        env.AutoLoad = false
        env.ProductKey = license
        env.ResourcesPath = resourcePath
        console.log('done parameters specified')
        res({ status: true, reason: '' })
    })
}
```

```ts
async function _createDWTObj(id: string, createEx: boolean): Promise<WebTwain> {
    const env: WebTwainEnv = dwt.WebTwainEnv
    return new Promise((res, rej) => {
        console.log('_createDWTObj')
        if (createEx) {
            const config: DWTInitialConfig = {
                WebTwainId: id
            }
            env.CreateDWTObjectEx(config, (twain) => {
                console.log(twain)
                console.log('created')
                res(twain)
            }, (reason) => {
                console.error(reason)
            })
        } else {
            const containers = [
                {
                    WebTwainId: id,
                    ContainerId: id,
                    Width: '100%',
                    Height: '100%',
                    bLocalService: true
                }
            ]
            env.Containers = containers
            env.OnWebTwainReady = (() => {
                res(env.GetWebTwain(id))
            }) as () => {}
            env.OnWebTwainNotFound = rej as () => {}
            env.Load()
        }
    })
}
```

然后，我们撰写一个`_init`方法，将初始化流程串联起来。

```flow
unmount=>operation: Delete the dwtobj with corresponding id
mount=>operation: Specify WebTWAIN environment
create=>operation: Create a dwt object

unmount->mount->create
```

```ts
async function _init(license: string, id: string,
                    resourcePath: string, createEx: boolean): Promise<WebTwain> {
    let mountResult!: DWTInitResult
    try {
        console.log('mounting dwt')
        mountResult = await _mountDwt(license, id, resourcePath)
        console.log(mountResult)
    } catch (e) {
        console.error(e)
    }
    if (!mountResult.status) {
        console.error('mounted failed')
        Promise.reject({ errCode: -114514, errString: 'mounted failed' })
    }
    let dwtObj!: WebTwain
    try {
        console.log('create dwtobj')
        dwtObj = await _createDWTObj(id, createEx)
        console.log(dwtObj)
    } catch (e) {
        console.error(e)
    }
    return Promise.resolve(dwtObj)
}
```

最后，我们设计与实现导出函数，接收参数、初始化、并将初始化好的DWT实例导出。由于创建Viewer需要依赖于`div`元素，而`setup`周期尚未解析进行渲染，因此我们需要将初始化流程放在挂载后执行。在Option API中，我们利用`mounted`在对应的周期执行相应的方法，在Compsition API里，我们利用其提供的`onMount`实现相同的效果。

在这里，我们顺便也获取当前所有扫描仪，并将结果列表的第1个作为默认使用的扫描仪。我们将代表当前激活扫描仪的`activeScanner`注册到`watch`函数，并指定相应的处理函数处理`activeScanner`的变化。在这里，`watch`函数与Option API里的`watch`对象相对应。

非常关键地，需要导出的数据，我们必须用`ref`进行响应式包装，以保证Vue能对它们的变化做出相应。在Composition API中，未经`ref`、`reactive`、`toRefs`包装的数据，都是简单数据，Vue不会对它们的变化做出响应。

```ts
export default function useDwt(license: string, resourcePath: string,
                               id: string, createEx = false) {
    const dwtObj = ref(null as unknown as WebTwain)
    const scanners = ref([] as Scanner[])
    const activeScanner = ref(null as unknown as Scanner)
    const init = async () => {
        try {
            dwtObj.value = await _init(license, id, resourcePath, createEx)
            scanners.value = await _getScanners(dwtObj.value)
            activeScanner.value = scanners.value[0]
        } catch(reason) {
            console.error(reason)
        }
    }

    onMounted(init)

    watch(activeScanner, () => {
        const obj: WebTwain = dwtObj.value
        obj.SelectSourceByIndex(activeScanner.value.id)
    })

    return {
        dwtObj,
        scanners,
        activeScanner
    }
```

在需要使用DWT的组件中，我们通过引入`useDwt`模块，在`setup`函数调用`useDwt`方法，实现Dwt加载流程的调用。

```ts
import useDwt from "@/components/useDwt"
import { defineComponent, toRefs } from 'vue'

const Component = defineComponent({
  // ...
  props: {
    license: {
      type: String,
      default: 'trial key'
    },
    resourcePath: {
      type: String,
      default: ''
    },
    webTwainId: {
      type: String,
      default: 'dwt-object'
    }
  },
  setup(props) {
    const { license, resourcePath, webTwainId } = toRefs(props)
    const { dwtObj, scanners, activeScanner } = useDwt(license.value, resourcePath.value, webTwainId.value, false)
    return {
      dwtObj: dwtObj,
      scanners: scanners,
      activeScanner: activeScanner
    }
  },
  // ...
})
export default Component
```
