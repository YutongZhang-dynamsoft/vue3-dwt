import { ref, onMounted, computed } from 'vue'

import dwt from 'dwt'
import {DWTInitialConfig, WebTwainEnv} from "dwt/Dynamsoft";
import {WebTwain} from "dwt/WebTwain";

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

async function _createDWTObj(id: string, createEx: boolean): Promise<WebTwain> {
    const env: WebTwainEnv = dwt.WebTwainEnv
    return new Promise((res, rej) => {
        console.log('_createDWTObj')
        if (createEx) {
            const config: DWTInitialConfig = {
                WebTwainId: id,
                // Host: 'localhost',
                // Port: '',
                // SSLPort: ''
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
            // env.CreateDWTObject(id, (twain) => {
            //     console.log(twain)
            //     console.log('created')
            //     res(twain)
            // }, (reason) => {
            //     console.error(reason)
            // })
        }
    })
}

async function _init(license: string, id: string,
                    resourcePath: string, createEx: boolean): Promise<WebTwain> {
    // console.log(`_init: license: ${license}, resourcePath: ${resourcePath}, id: ${id}, createEx: ${createEx}`)
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

export default function useDwt(license: string, resourcePath: string,
                               id: string, createEx = false) {
    // console.log(`useDwt: license: ${license}, resourcePath: ${resourcePath}, id: ${id}, createEx: ${createEx}`)
    const dwtObj = ref(null as unknown as WebTwain)
    const scanners = ref([] as Scanner[])
    const init = async () => {
        try {
            dwtObj.value = await _init(license, id, resourcePath, createEx)
            scanners.value = await _getScanners(dwtObj.value)
        } catch(reason) {
            console.error(reason)
        }
    }

    onMounted(init)
    return {
        dwtObj,
        scanners
    }
}
