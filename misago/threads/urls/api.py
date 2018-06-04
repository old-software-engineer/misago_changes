from misago.core.apirouter import MisagoApiRouter
from misago.threads.api.attachments import AttachmentViewSet
from misago.threads.api.threadpoll import ThreadPollViewSet
from misago.threads.api.threadposts import PrivateThreadPostsViewSet, ThreadPostsViewSet
from misago.threads.api.threads import PrivateThreadViewSet, ThreadViewSet
from django.conf.urls import include, url


router = MisagoApiRouter()

router.register(r'attachments', AttachmentViewSet, base_name='attachment')

router.register(r'threads', ThreadViewSet, base_name='thread')
router.register(
    r'threads/(?P<thread_pk>[^/.]+)/posts', ThreadPostsViewSet, base_name='thread-post'
)
router.register(r'threads/(?P<thread_pk>[^/.]+)/poll', ThreadPollViewSet, base_name='thread-poll')

router.register(r'private-threads', PrivateThreadViewSet, base_name='private-thread')
router.register(
    r'private-threads/(?P<thread_pk>[^/.]+)/posts',
    PrivateThreadPostsViewSet,
    base_name='private-thread-post'
)
send_email = [
    url(
        r'threads/(?P<thread_pk>[^/.]+)/send_email/(?P<email_id>[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})/(?P<user_id>[^/.]+)', ThreadViewSet.send_email, name='thread-invite'
    ),
    url(r'threads/(?P<thread_pk>[^/.]+)/report/(?P<type>[^/.]+)/(?P<user_id>[^/.]+)', ThreadViewSet.report, name='report'),
    url(r'threads/(?P<user_id>[^/.]+)/get_all_reports', ThreadViewSet.get_all_reports, name='get-all-reports'),
]

urlpatterns = router.urls + send_email
