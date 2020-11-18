<template>
  <div id="dwt-instance">
    <div id="dwt-container">
    </div>
    <div id="dwt-control">
      <select v-model="activeScanner" name="scanner">
        <option v-for="(opt, idx) in scanners" :key="idx"
                :value="opt">{{opt.name}}</option>
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
import { defineComponent, toRefs } from 'vue'
import dwt from 'dwt'
import useDwt, { DWTEnvConfig } from "@/composable/useDwt";
import useCamera from "@/composable/useCamera"
import { WebTwain } from 'dwt/WebTwain'
import { DeviceConfiguration } from "dwt/WebTwain.Acquire";

const Component = defineComponent({
  name: 'dwt-composited',
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
    const config: DWTEnvConfig = {
      ProductKey: license.value,
      ResourcesPath: resourcePath.value
    }
    const createEx = false
    const { dwtObj, scanners, activeScanner } = useDwt(config, webTwainId.value, createEx)
    console.log(dwtObj.value)
    const { camera, cameraSourceOptions, resolutionOptions, rotateOptions } = useCamera(dwtObj.value)
    return {
      dwtObj: dwtObj,
      scanners: scanners,
      activeScanner: activeScanner,
      camera: {
        cameraObj: camera,
        sourceOptions: cameraSourceOptions,
        resolutionOptions: resolutionOptions,
        rotateOptions: rotateOptions
      }
    }
  },
  data() {
    return {
      config: {
        // activeScannerName: '',
        colorModeVal: dwt.EnumDWT_PixelType.TWPT_RGB,
        resolutionVal: 300,
        ifShowUI: true,
        autoFeeder: false,
        duplex: false
      },
      systemEnum: {
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
  methods: {
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
#dwt-container {
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