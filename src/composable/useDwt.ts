import { ref, onMounted, watch } from 'vue'

import dwt from 'dwt'
import {Container, DWTInitialConfig, WebTwainEnv} from "dwt/Dynamsoft";
import {WebTwain} from "dwt/WebTwain";

export interface DWTEnvConfig {
    ActiveXInstallWithCAB?: boolean;
    AutoLoad?: boolean;
    Containers?: Container[];
    IfAddMD5UploadHeader?: boolean;
    IfConfineMaskWithinTheViewer?: boolean;
    IfUseActiveXForIE10Plus?: boolean;
    ProductKey: string;
    ResourcesPath: string;
    UseCameraAddonWasm?: boolean;
    UseLocalService?: boolean;
}

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

async function _mountDwt(id: string, createEx: boolean): Promise<WebTwain> {
    const unMountResult: DWTInitResult = await _unmountDwt(id)
    const env: WebTwainEnv = dwt.WebTwainEnv
    return new Promise((res, rej) => {
        if (!unMountResult.status) {
            console.error(unMountResult)
            rej(unMountResult)
        }
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
/*
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
*/
async function _init(config: DWTEnvConfig, id: string, createEx: boolean): Promise<WebTwain> {
    const env = dwt.WebTwainEnv
    dwt.WebTwainEnv = Object.assign(env, config)
    let dwtObj!: WebTwain
    try {
        console.log('mounting dwt')
        dwtObj = await _mountDwt(id, createEx)
    } catch (e) {
        console.error(e)
        return Promise.reject({ status: false, reason: 'create dwt object failed' })
    }
    return Promise.resolve(dwtObj)
}

interface Scanner {
    id: number;
    name: string;
}

function _getScanners(dwt: WebTwain): Promise<Scanner[]> {
    return new Promise<Scanner[]>((res) => {
        const src: string[] = dwt.GetSourceNames(false) as string[]
        const scanners: Scanner[] = src.map((scanner, idx) => ({
            id: idx, name: scanner
        }))
        res(scanners)
    })
}

export default function useDwt(config: DWTEnvConfig, id: string, createEx: boolean) {
    if (!config) {
        throw new Error('empty config')
    }
    const dwtObj = ref(null as unknown as WebTwain)
    const scanners = ref([] as Scanner[])
    const activeScanner = ref(null as unknown as Scanner)
    const init = async () => {
        try {
            dwtObj.value = await _init(config, id, createEx)
            console.log('onMounted | useDwt: created')
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
}
/*
function useDwtOld(license: string, resourcePath: string,
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
}
*/