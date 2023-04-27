import {Plugin, registerPlugin} from 'enmity/managers/plugins'
import {React,Linking} from 'enmity/metro/common'
import {create} from 'enmity/patcher'
// @ts-ignore
import manifest, {name as plugin_name} from '../manifest.json'
import Settings from "./components/Settings"

const Patcher = create('FixEnmityLink')

const FixEnmityLink: Plugin = {
    ...manifest,
    onStart() {
        Patcher.before(Linking,"openURL", (self,args,org)=>{
            args[0] = args[0].replace(/^enmity:\/\//,"com.hammerandchisel.discord://")
        })
    },
    onStop() {
        Patcher.unpatchAll()
    },
    getSettingsPanel({settings}) {
        return <Settings settings={settings}/>
    }
}

registerPlugin(FixEnmityLink)
