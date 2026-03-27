from django.contrib import admin
from .models import Page, PageVersion, ReusableBlock

admin.site.register(Page)
admin.site.register(PageVersion)
admin.site.register(ReusableBlock)
