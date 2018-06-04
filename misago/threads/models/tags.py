from __future__ import unicode_literals

import copy

from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.fields import JSONField
from django.contrib.postgres.search import SearchVector, SearchVectorField
from django.db import models
from django.utils import six, timezone
from django.utils.encoding import python_2_unicode_compatible

from misago.conf import settings
from misago.core.pgutils import PgPartialIndex
from misago.core.utils import parse_iso8601_string
from misago.markup import finalise_markup
from misago.threads.checksums import is_post_valid, update_post_checksum
from misago.threads.filtersearch import filter_search


@python_2_unicode_compatible
class Tag(models.Model):
    thread = models.ForeignKey(
        'misago_threads.Thread',
        on_delete=models.CASCADE,
    )
    tag_name = models.CharField(max_length=64)

    created_on = models.DateTimeField(db_index=True)
    updated_on = models.DateTimeField()

    search_document = models.TextField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['tag_name']),
        ]

    def __str__(self):
        return '%s...' % self.tag_name
