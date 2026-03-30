from django.db import models
from django.conf import settings


class Page(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255, db_index=True)
    content_json = models.JSONField(default=dict, blank=True)
    is_published = models.BooleanField(default=False, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_pages',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.slug})"


class PageVersion(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='versions')
    content_json = models.JSONField(default=dict, blank=True)
    version_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['page', 'version_number'], name='unique_page_version_number'),
        ]
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.page.slug} v{self.version_number}"


class ReusableBlock(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    content_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.category}: {self.name}"


class HomepageSection(models.Model):
    SECTION_TYPES = (
        ('hero', 'Hero Section'),
        ('bestsellers', 'Best Sellers'),
        ('featured', 'Featured Products'),
        ('trending', 'Trending Now'),
        ('new_arrivals', 'New Arrivals'),
        ('categories', 'Category Grid'),
        ('newsletter', 'Newsletter Sign-up'),
    )

    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    section_type = models.CharField(max_length=50, choices=SECTION_TYPES)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    # For HERO or BANNER types
    image_url = models.URLField(max_length=500, blank=True, null=True)
    cta_text = models.CharField(max_length=100, blank=True, null=True)
    cta_link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} ({self.section_type})"
