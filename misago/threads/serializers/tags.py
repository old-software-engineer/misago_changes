from rest_framework import serializers

from django.urls import reverse

from misago.core.serializers import MutableFields
from misago.threads.models import Tag
from misago.users.serializers import UserSerializer as BaseUserSerializer


__all__ = ['TagSerializer']


class TagSerializer(serializers.ModelSerializer, MutableFields):
    class Meta:
        model = Tag
        fields = [
            'id',
            'tag_name',
            'created_on',
            'updated_on',
            'search_document',
            'thread_id',
        ]