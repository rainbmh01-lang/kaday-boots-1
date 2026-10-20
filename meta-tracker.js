/**
 * Meta Pixel & Conversions API (CAPI) client integration for Matjari Store
 * Deduplicates events between Browser Pixel and Server CAPI via matching eventID.
 * Captures and persists Meta ClickID (fbc), Browser ID (fbp), and external_id.
 * Maximizes Event Match Quality (EMQ) score to 9.0+/10.
 */

(function (window, document) {
  'use strict';

  function generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    if (typeof document === 'undefined') return;
    const maxAge = (days || 90) * 86400;
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
  }

  function getMetaIdentifiers() {
    if (typeof window === 'undefined') {
      return { fbp: null, fbc: null, external_id: null };
    }

    // 1. Meta ClickID (fbc)
    let fbc = getCookie('_fbc');
    if (!fbc && window.localStorage) {
      try {
        fbc = localStorage.getItem('_fbc');
      } catch (e) {}
    }

    // Extract fbclid from URL if present
    let fbclid = null;
    try {
      if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        fbclid = params.get('fbclid');
      }
      if (!fbclid && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        fbclid = hashParams.get('fbclid');
      }
    } catch (e) {}

    if (fbclid) {
      fbc = 'fb.1.' + Date.now() + '.' + fbclid;
      setCookie('_fbc', fbc, 90);
      try {
        localStorage.setItem('_fbc', fbc);
      } catch (e) {}
    } else if (fbc) {
      setCookie('_fbc', fbc, 90);
      try {
        localStorage.setItem('_fbc', fbc);
      } catch (e) {}
    }

    // 2. Meta Browser ID (fbp)
    let fbp = getCookie('_fbp');
    if (!fbp && window.localStorage) {
      try {
        fbp = localStorage.getItem('_fbp');
      } catch (e) {}
    }

    if (!fbp) {
      fbp = 'fb.1.' + Date.now() + '.' + Math.floor(1000000000 + Math.random() * 9000000000);
      setCookie('_fbp', fbp, 90);
      try {
        localStorage.setItem('_fbp', fbp);
      } catch (e) {}
    } else {
      setCookie('_fbp', fbp, 90);
      try {
        localStorage.setItem('_fbp', fbp);
      } catch (e) {}
    }

    // 3. Persistent External ID (visitor/customer tracking)
    let externalId = getCookie('_ext_id');
    if (!externalId && window.localStorage) {
      try {
        externalId = localStorage.getItem('_ext_id');
      } catch (e) {}
    }

    if (!externalId) {
      externalId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      setCookie('_ext_id', externalId, 365);
      try {
        localStorage.setItem('_ext_id', externalId);
      } catch (e) {}
    }

    return {
      fbp: fbp,
      fbc: fbc,
      external_id: externalId,
    };
  }

  async function sendMetaEvent(eventName, customData, userData, customEventId) {
    customData = customData || {};
    userData = userData || {};
    const eventId = customEventId || generateEventId();
    const eventTime = Math.floor(Date.now() / 1000);
    const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : '';
    const ids = getMetaIdentifiers();

    const finalUserData = Object.assign({}, userData, {
      fbp: userData.fbp || ids.fbp,
      fbc: userData.fbc || ids.fbc,
      external_id: userData.external_id || ids.external_id,
      client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });

    // 1. Browser Meta Pixel (Deduplication via eventID)
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      try {
        window.fbq('track', eventName, customData, { eventID: eventId });
      } catch (err) {
        console.warn('[Meta Pixel] track failed:', err);
      }
    }

    // 2. Server-side Conversions API (CAPI)
    try {
      fetch('/api/capi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: eventName,
          eventId: eventId,
          eventTime: eventTime,
          eventSourceUrl: eventSourceUrl,
          userData: finalUserData,
          customData: customData,
        }),
      }).catch(function (err) {
        console.warn('[Meta CAPI] POST /api/capi error:', err);
      });
    } catch (err) {
      console.warn('[Meta CAPI] Dispatch exception:', err);
    }

    return eventId;
  }

  function trackPageView(url) {
    return sendMetaEvent('PageView', {}, {}, undefined);
  }

  function trackViewContent(item) {
    item = item || {};
    return sendMetaEvent('ViewContent', {
      content_name: item.name || 'BOOTS DE SECURITE BEETRO',
      content_category: item.category || 'Chaussures de sécurité',
      content_ids: [item.id || 'BOOTS-BEETRO'],
      content_type: 'product',
      value: item.price || 4400,
      currency: 'DZD',
    });
  }

  function trackAddToCart(item, quantity) {
    item = item || {};
    quantity = quantity || 1;
    const price = item.price || 4400;
    return sendMetaEvent('AddToCart', {
      content_name: item.name || 'BOOTS DE SECURITE BEETRO',
      content_ids: [item.id || 'BOOTS-BEETRO'],
      content_type: 'product',
      value: price * quantity,
      currency: 'DZD',
      num_items: quantity,
    });
  }

  function trackInitiateCheckout(item, total, userData) {
    item = item || {};
    return sendMetaEvent(
      'InitiateCheckout',
      {
        content_type: 'product',
        content_ids: [item.id || 'BOOTS-BEETRO'],
        content_name: item.name || 'BOOTS DE SECURITE BEETRO',
        num_items: item.quantity || 1,
        value: total || 4900,
        currency: 'DZD',
      },
      userData || {}
    );
  }

  function trackPurchase(data) {
    data = data || {};
    const eventId = data.orderId || generateEventId();
    return sendMetaEvent(
      'Purchase',
      {
        content_name: data.productName || 'BOOTS DE SECURITE BEETRO',
        content_ids: [data.productId || 'BOOTS-BEETRO'],
        content_type: 'product',
        value: data.total || 4900,
        currency: 'DZD',
        num_items: data.quantity || 1,
      },
      {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        city: data.commune,
        state: data.wilaya,
        country: 'dz',
        external_id: data.externalId || data.orderId,
      },
      eventId
    );
  }

  function trackLead(data) {
    data = data || {};
    return sendMetaEvent(
      'Lead',
      {
        value: data.total || 4900,
        currency: 'DZD',
        content_name: data.productName || 'BOOTS DE SECURITE BEETRO',
      },
      {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        city: data.commune,
        state: data.wilaya,
        country: 'dz',
        external_id: data.externalId || data.orderId,
      }
    );
  }

  window.MetaTracker = {
    generateEventId: generateEventId,
    getCookie: getCookie,
    setCookie: setCookie,
    getMetaIdentifiers: getMetaIdentifiers,
    sendMetaEvent: sendMetaEvent,
    trackPageView: trackPageView,
    trackViewContent: trackViewContent,
    trackAddToCart: trackAddToCart,
    trackInitiateCheckout: trackInitiateCheckout,
    trackPurchase: trackPurchase,
    trackLead: trackLead,
  };

  // Automatically fire PageView exactly once on load with matching eventID
  let pageViewFired = false;
  function initPageView() {
    if (pageViewFired) return;
    pageViewFired = true;
    trackPageView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageView, { once: true });
  } else {
    initPageView();
  }
})(window, document);
