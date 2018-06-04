from __future__ import unicode_literals
from django.db import models
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible
class Report(models.Model):
    report_type = models.CharField(max_length=64)
    reporter_id = models.PositiveIntegerField()
    record_id = models.PositiveIntegerField(default=0)
    created_on = models.DateTimeField(db_index=True)
    updated_on = models.DateTimeField()


    class Meta:
        indexes = [
            models.Index(fields=['report_type']),
        ]

    def __str__(self):
        return '%s...' % self.report_type
