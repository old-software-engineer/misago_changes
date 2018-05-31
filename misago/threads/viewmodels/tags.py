from django.shortcuts import get_object_or_404, get_list_or_404

from misago.core.viewmodel import ViewModel as BaseViewModel
from misago.threads.serializers import TagSerializer

__all__ = ['ThreadTag']


class ViewModel(BaseViewModel):
    def __init__(self, request, thread, pk):
        model = self.get_tag(request, thread, pk)

        self._model = model

    def get_tag(self, request, thread, pk):
        try:
            thread_model = thread.unwrap()
        except AttributeError:
            thread_model = thread

        queryset = thread_model.tag_set.filter(thread_id=pk)

        try:
            tag = get_list_or_404(queryset)
            result = list(tag)
        except:
            result = ""
        return result

    def get_frontend_context(self):
        context = {
            'results': TagSerializer(self._model, many=True).data
        }
        return context


class ThreadTag(ViewModel):
    pass
