import os

from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response

from django.core.mail import send_mail

from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.utils.translation import ugettext as _

from misago.categories import PRIVATE_THREADS_ROOT_NAME, THREADS_ROOT_NAME
from misago.core.shortcuts import get_int_or_404
from misago.threads.models import Post, Thread, Tag
from misago.threads.moderation import threads as moderation
from misago.threads.permissions import allow_use_private_threads
from misago.threads.viewmodels import (ForumThread, PrivateThread,
    ThreadsRootCategory, PrivateThreadsCategory)

from .postingendpoint import PostingEndpoint
from .threadendpoints.delete import delete_bulk, delete_thread
from .threadendpoints.editor import thread_start_editor
from .threadendpoints.list import private_threads_list_endpoint, threads_list_endpoint
from .threadendpoints.merge import thread_merge_endpoint, threads_merge_endpoint
from .threadendpoints.patch import bulk_patch_endpoint, thread_patch_endpoint
import json
from django.http import JsonResponse

from django.http import HttpResponse
from misago.users.models import user
from misago.threads.models import Report
from misago.threads.models import UserInvitation
from misago.users.models import User
import datetime
from django.core import serializers
import devproject.settings as setting
from django.utils import timezone

class ViewSet(viewsets.ViewSet):
    thread = None

    def get_thread(self, request, pk, path_aware=False, read_aware=False, subscription_aware=False):
        return self.thread(
            request,
            get_int_or_404(pk),
            path_aware=path_aware,
            read_aware=read_aware,
            subscription_aware=subscription_aware,
        )

    def retrieve(self, request, pk):
        thread = self.get_thread(
            request,
            pk,
            path_aware=True,
            read_aware=True,
            subscription_aware=True,
        )

        return Response(thread.get_frontend_context())

    @transaction.atomic
    def partial_update(self, request, pk=None):
        thread = self.get_thread(request, pk).unwrap()
        return thread_patch_endpoint(request, thread)

    def patch(self, request):
        return bulk_patch_endpoint(request, self.thread)

    def delete(self, request, pk=None):
        if pk:
            thread = self.get_thread(request, pk).unwrap()
            return delete_thread(request, thread)
        return delete_bulk(request, self.thread)


class ThreadViewSet(ViewSet):
    category = ThreadsRootCategory
    thread = ForumThread

    def list(self, request):
        return threads_list_endpoint(request)

    @transaction.atomic
    def create(self, request):
        # Initialize empty instances for new thread
        thread = Thread()
        post = Post(thread=thread)
        tag = Tag(thread=thread)

        # Put them through posting pipeline
        posting = PostingEndpoint(
            request,
            PostingEndpoint.START,
            tree_name=THREADS_ROOT_NAME,
            thread=thread,
            post=post,
            tag=tag,
        )

        if posting.is_valid():
            posting.save()

            return Response({
                'id': thread.pk,
                'title': thread.title,
                'url': thread.get_absolute_url(),
            })
        else:
            return Response(posting.errors, status=400)

    @detail_route(methods=['post'], url_path='merge')
    @transaction.atomic
    def thread_merge(self, request, pk=None):
        thread = self.get_thread(request, pk).unwrap()
        return thread_merge_endpoint(request, thread, self.thread)



    @list_route(methods=['post'], url_path='merge')
    @transaction.atomic
    def threads_merge(self, request):
        return threads_merge_endpoint(request)

    @list_route(methods=['get'])
    def editor(self, request):
        return thread_start_editor(request)




class PrivateThreadViewSet(ViewSet):
    category = PrivateThreadsCategory
    thread = PrivateThread

    def list(self, request):
        return private_threads_list_endpoint(request)

    @transaction.atomic
    def create(self, request):
        allow_use_private_threads(request.user)
        if not request.user.acl_cache['can_start_private_threads']:
            raise PermissionDenied(_("You can't start private threads."))

        request.user.lock()

        # Initialize empty instances for new thread
        thread = Thread()
        post = Post(thread=thread)
        tag = Tag(thread=thread)
        # Put them through posting pipeline
        posting = PostingEndpoint(
            request,
            PostingEndpoint.START,
            tree_name=PRIVATE_THREADS_ROOT_NAME,
            thread=thread,
            post=post,
            tag=tag,
        )

        if posting.is_valid():
            posting.save()

            return Response({
                'id': thread.pk,
                'title': thread.title,
                'url': thread.get_absolute_url(),
            })
        else:
            return Response(posting.errors, status=400)

    
@detail_route(methods=['get', 'post'])
def report(self, thread_pk, type, user_id):
    if type == "post":
        report_type = "answer"
    elif type == "thread":
        report_type = "question"
    response_data = {}
    created = datetime.datetime.now()
    updated = datetime.datetime.now()
    try:
        Report.objects.create(record_id=thread_pk, report_type=report_type,reporter_id=user_id,created_on= created,updated_on= updated)
        response_data['result'] = "True"
        response = HttpResponse(json.dumps(response_data), status='200', content_type="application/json")
    except:
        response_data['result'] = "False"
        response = HttpResponse(json.dumps(response_data), status='400', content_type="application/json")
    return response


@detail_route(methods=['get'])
def get_all_reports(self, user_id):
    response_data = {}
    result = {}
    count = 0
    reports = Report.objects.all().order_by('-created_on')[:20]
    for report in reports:
        try:
            if report.report_type == "answer":
                thread_id = Post.objects.get(pk=report.record_id).thread.id
                thread_title = Post.objects.get(pk=report.record_id).thread.slug
                url = "/" + str(thread_title) + "/" + str(thread_id)+ "/post/" + str(report.record_id)
            elif report.report_type == "question":
                title = Thread.objects.get(id=report.record_id).slug
                record_id = report.record_id
                url = "/" + str(title) + "/" + str(record_id)
            username = User.objects.get(pk=report.reporter_id).username
            response_data["reported_by"] = username
            response_data["report_type"] = report.report_type
            response_data["report_id"] = url
            result[count] = response_data
            response_data = {}
        except:
            response_data = {}
        count = count + 1
    response = HttpResponse(json.dumps(result), status='200', content_type="application/json")
    return response

@detail_route(methods=['get', 'post'])
def send_email(self, thread_pk, email_id, user_id):
    thread_url =thread_url ='http://188.166.216.153:8000/t/' + Thread.objects.get(pk=thread_pk).slug + '/' + thread_pk
    inviter_email = user.User.objects.get(pk=user_id).email
    subject = "Invitation For Discussion"
    message = "Hello, You Got an invitaion to join the discussion for %s by %s" %(thread_url,inviter_email)
    from_email = setting.EMAIL_HOST_USER
    to_email = email_id
    created = datetime.datetime.now(tz=timezone.utc)
    updated = datetime.datetime.now(tz=timezone.utc)
    try:
        User.objects.get(pk=user_id).userinvitation_set.create(invited_email=email_id, created_on=created, updated_on=updated)
        # UserInvitation.objects.create(invited_email=email_id, invitor_id=user_id, created_on=created, updated_on=updated)
        response = send_mail(subject, message, from_email, [to_email])
    except:
        response = 0;

    response_data = {}
    if response == 1:
        result = "True"
    else:
        result = "False"
    response_data['result'] = result
    return HttpResponse(json.dumps(response_data), status='200', content_type="application/json")