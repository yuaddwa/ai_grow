<script>
import { getAccessToken } from './utils/api.js'
import { connect } from './utils/websocket.js'
import { refreshUnreadCount } from './utils/store.js'
import { setupPushListeners, consumePendingPushNavigation } from './utils/push.js'
import { onAuthSuccess, bindRealtimeHandler } from './utils/afterAuth.js'

export default {
	onLaunch: function() {
		setupPushListeners()
		bindRealtimeHandler()
		if (getAccessToken()) {
			onAuthSuccess()
			consumePendingPushNavigation()
		}
	},
	onShow: function() {
		if (getAccessToken()) {
			refreshUnreadCount()
			connect()
			consumePendingPushNavigation()
		}
	}
}
</script>

<style>
	/* 禁止页面级橡皮筋回弹，避免到顶后整屏下拉变形 */
	page {
		height: 100%;
		overflow: hidden;
		overscroll-behavior: none;
	}
</style>
