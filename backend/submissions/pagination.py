import math

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class SubmissionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "pageSize"
    max_page_size = 100

    def get_paginated_response(self, data):
        count = self.page.paginator.count
        page_size = self.get_page_size(self.request)
        total_pages = math.ceil(count / page_size) if page_size and count else 1
        return Response(
            {
                "count": count,
                "totalPages": total_pages,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )
