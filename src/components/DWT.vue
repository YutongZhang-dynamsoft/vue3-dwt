<template>
  <div id="dwt-instance">
    <div id="dwt-container">
    </div>
    <div id="dwt-control">
      <select v-model="config.activeScannerName" name="scanner">
        <option v-for="(opt, idx) in systemEnum.scanners" :key="idx"
                :value="opt.name">{{opt.name}}</option>
      </select>
      <select v-model="config.resolutionVal">
        <option v-for="(opt, idx) in systemEnum.resolutionOptions" :key="idx"
                :value="opt.val"
        >
          {{opt.text}}
        </option>
      </select>
      <select v-model="config.colorModeVal">
        <option v-for="(opt, idx) in systemEnum.colorModes" :key="idx"
                :value="opt.id"
        >
          {{opt.text}}
        </option>
      </select>
      <button class="btn-primary" @click="acquireImage">Acquire Image</button>
      <button class="btn-secondary" @click="openEditor">Open Image Editor</button>
    </div>
    <div id="dwt-editor-wrap">
      <div id="dwt-editor"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import dwt from 'dwt'
import { WebTwain } from 'dwt/WebTwain'
import {DeviceConfiguration} from "dwt/WebTwain.Acquire";

interface Scanner {
  id: number;
  name: string;
}

const Component = defineComponent({
  name: 'dwt',
  props: {
    license: {
      type: String,
      default: 'trial key'
    }
  },
  data() {
    return {
      dwtObj: null as unknown as WebTwain,
      webTwainId: 'dwt-instance',
      config: {
        activeScannerName: '',
        colorModeVal: dwt.EnumDWT_PixelType.TWPT_RGB,
        resolutionVal: 300,
        ifShowUI: true,
        autoFeeder: false,
        duplex: false
      },
      systemEnum: {
        scanners: [] as Scanner[],
        colorModes: [
          { id: dwt.EnumDWT_PixelType.TWPT_BW, text: 'Black & White' },
          { id: dwt.EnumDWT_PixelType.TWPT_GRAY, text: 'Grayscale' },
          { id: dwt.EnumDWT_PixelType.TWPT_RGB, text: 'Color' }
        ],
        resolutionOptions: [
          { val: 150, text: '150' },
          { val: 200, text: '200' },
          { val: 300, text: '300' }
        ]
      }
    }
  },
  mounted () {
    this.mountDWT()
      .then(() => {
        return new Promise(res => {
          this.dwtObj = dwt.WebTwainEnv.GetWebTwain(this.webTwainId)
          res()
        })
      })
      .then(() => {
        this.getScanners()
      })
      .catch(reason => {
        console.error(reason)
      })
  },
  methods: {
    mountDWT(): Promise<void> {
      const twenv = dwt.WebTwainEnv
      return new Promise((res, rej) => {
        twenv.AutoLoad = false
        twenv.ResourcesPath = 'dwt-resources'
        twenv.ProductKey = this.$props.license
        twenv.Containers = [
          {
            WebTwainId: this.webTwainId,
            ContainerId: 'dwt-container',
            Width: '800px',
            Height: '600px',
            bLocalService: true
          }
        ]
        twenv.OnWebTwainReady = res as () => {}
        twenv.OnWebTwainNotFound = rej as () => {}
        twenv.Load()
      })
    },
    acquireImage(): void {
      const config: DeviceConfiguration = {
        PixelType: this.config.colorModeVal,
        Resolution: this.config.resolutionVal,
        IfShowUI: this.config.ifShowUI,
        IfFeederEnabled: this.config.autoFeeder,
        IfDuplexEnabled: this.config.duplex
      }
      const dwtObj: WebTwain = this.dwtObj
      const successCallback: () => void = () => {
        dwtObj.CloseSource()
      }
      const failureCallback: (deviceConfig: DeviceConfiguration, errCode: number, errMsg: string) => void
          = (errCode, errMsg) => {
            alert(`error code: ${errCode}, error message: ${errMsg}`)
          }
      dwtObj.AcquireImage(config, successCallback, failureCallback)
    },
    getScanners(): Promise<void|string> {
      return new Promise((res, rej) => {
        const dwtObj = this.dwtObj
        const src: string[] = dwtObj.GetSourceNames(false) as string[]
        const scanners: Scanner[] = src.map((scanner, idx) => {
          return { id: idx, name: scanner }
        })
        this.systemEnum.scanners = scanners
        if (scanners.length !== 0) {
          this.config.activeScannerName = scanners[0].name
          res()
        } else {
          rej('No scanner found')
        }
      })
    },
    openEditor(): void {
      const dwtObj = this.dwtObj
      const viewportWidth = window.innerWidth*0.9
      const viewportHeight = window.innerHeight*0.9
      dwtObj.ShowImageEditor(
          'dwt-editor',
          viewportWidth*1,
          viewportHeight*1
      )
    }
  }
})

export default Component
</script>

<style>
#dwt-instance {
  margin: 10px auto;
  width: 800px;
  height: 600px;
}
#dwt-control {
  display: flex;
  justify-content: center;
}
#dwt-editor {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>