from django.views.generic import TemplateView


class PortfolioView(TemplateView):
    template_name = 'portfolio/portfolio.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Portfolio'
        context['content'] = 'PORTFOLIO'
        return context
