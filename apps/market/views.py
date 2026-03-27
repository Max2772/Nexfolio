from django.views.generic import TemplateView


class StockMarket(TemplateView):
    template_name = 'market/stock_market.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Market'
        context['content'] = 'MARKET'
        return context
