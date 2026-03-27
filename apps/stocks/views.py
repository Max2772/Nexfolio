from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class StockView(LoginRequiredMixin, TemplateView):
    template_name = 'stocks/stock.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Stock'
        context['content'] = 'STOCKS'
        return context

class StockMarket(TemplateView):
    template_name = 'stocks/stock_market.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Market'
        context['content'] = 'MARKET'
        return context