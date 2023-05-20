import {Plugin, registerPlugin} from 'enmity/managers/plugins'
import {React, Linking} from 'enmity/metro/common'
import {create} from 'enmity/patcher'
// @ts-ignore
import manifest, {name as plugin_name} from '../manifest.json'
import Settings from "./components/Settings"
import {getByProps} from "enmity/modules"

const ReactNative = getByProps("View")
const {DCDChatManager} = ReactNative.NativeModules

const Patcher = create('FixEnmityLink')

const FixEnmityLink: Plugin = {
    ...manifest,
    onStart() {
        function convertToLink(content) { // 再帰的にcontentオブジェクト内のリンクを探す
            content = content.map((obj) => {
                if (typeof obj.content === "object") {
                    // 同様の処理をブロック内に対しても行う
                    obj.content = convertToLink(obj.content)
                }
                if (typeof obj.content === "string" && obj.content.startsWith("enmity://")) {
                    let url = obj.content
                    obj.type = "link"
                    obj.target = url
                    obj.content = [{
                        type: "text", content: url
                    }]
                }
                return obj
            })
            return content
        }

        // 180+でenmityプロトコルがリンクに変換されない問題を修正
        Patcher.before(DCDChatManager, "updateRows", (_, args, res) => {
            const rows = JSON.parse(args[1])
            for (const row of rows) {
                if (row?.message?.content) {
                    convertToLink(row.message.content)
                }
            }
            args[1] = JSON.stringify(rows)
        })

        // enmityスキームをDiscordのオリジナルのスキームに置換
        Patcher.before(Linking, "openURL", (self, args, org) => {
            args[0] = args[0].replace(/^enmity:\/\//, "com.hammerandchisel.discord://")
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
