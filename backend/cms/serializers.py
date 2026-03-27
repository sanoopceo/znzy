from rest_framework import serializers
from .models import Page, PageVersion, ReusableBlock


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            'id',
            'title',
            'slug',
            'content_json',
            'is_published',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class PageVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageVersion
        fields = ['id', 'page', 'content_json', 'version_number', 'created_at']
        read_only_fields = ['id', 'version_number', 'created_at']


class ReusableBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReusableBlock
        fields = ['id', 'name', 'category', 'content_json', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
