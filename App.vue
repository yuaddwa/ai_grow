<script>
import { getAccessToken } from './utils/api.js'
import { connect, onMessage } from './utils/websocket.js'
import { store } from './utils/store.js'

export default {
	onLaunch: function() {
		if (getAccessToken()) {
			connect()
			onMessage((data) => {
				if (data.unreadCount !== undefined) {
					store.unreadCount = data.unreadCount
				}
			})
		}
	},
	onShow: function() {
		if (getAccessToken()) {
			connect()
		}
	}
}
</script>

<style>
	/*每个页面公共css */
</style>
