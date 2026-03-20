from django.views.generic import TemplateView


class StocksView(TemplateView):
    template_name = 'stocks/stocks.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Stocks'
        context['content'] = 'STOCKS'
        return context
