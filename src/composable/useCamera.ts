import { WebTwain } from 'dwt/WebTwain';
import { ref, onMounted } from 'vue';
import dwt from 'dwt';
import { Camera, DeviceInfo, Resolution } from 'dwt/Addon.Camera';

const ROTATE = dwt.EnumDWT_VideoRotateMode

interface RotateOption {
  text: string;
  val: number;
}

function enumRotation(): RotateOption[] {
  return [
    { text: 'OFF', val: ROTATE.VRM_NONE },
    { text: 'CLOCKWISE 90°', val: ROTATE.VRM_90_DEGREES_CLOCKWISE },
    { text: 'CLOCKWISE 180°', val: ROTATE.VRM_180_DEGREES_CLOCKWISE },
    { text: 'CLOCKWISE 270°', val: ROTATE.VRM_270_DEGREES_CLOCKWISE },
    { text: 'FLIP VERTICAL', val: ROTATE.VRM_FLIP_VERTICAL },
    { text: 'FLIP HORIZONTAL', val: ROTATE.VRM_FLIP_HORIZONTAL }
  ]
}

interface ResolutionOption {
  text: string;
  val: Resolution;
}

async function enumResolution(camera: Camera): Promise<ResolutionOption[]> {
  const resolutions = await camera.getResolution()
  return resolutions.map(res => ({
      text: `${res.width} x ${res.height}`,
      val: res
  }))
}

interface CameraSourceOption {
  text: string;
  deviceId: string;
}

async function enumSource(camera: Camera): Promise<CameraSourceOption[]> {
  const cameraSrcs: DeviceInfo[] = await camera.getSourceList()
  return cameraSrcs.map(cam => ({
    text: cam.label,
    deviceId: cam.deviceId
  }))
}

export default function useCamera(dwtObj: WebTwain) {

  const camera = ref(null as unknown as Camera)
  const resolutionOptions = ref([] as ResolutionOption[])
  const cameraSourceOptions = ref([] as CameraSourceOption[])
  const rotateOptions = ref(enumRotation())

  const init = () => {
    camera.value = dwtObj.Addon.Camera
    console.log('onMounted | useCamera: have tried fetching the camera addon')
    enumSource(camera.value)
      .then(cameras => { cameraSourceOptions.value = cameras })
    enumResolution(camera.value)
      .then(resolutions => { resolutionOptions.value = resolutions })
  }
  
  onMounted(init)

  return {
    camera,
    cameraSourceOptions,
    resolutionOptions,
    rotateOptions
  }
}