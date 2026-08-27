// wa.me solo acepta dígitos (código de país + número, sin +/espacios/guiones).
// Los dueños suelen registrar su celular a 10 dígitos sin indicativo — se
// asume Colombia (57) en ese caso.
export function urlWhatsapp(telefono: string, mensaje: string): string {
  let soloDigitos = telefono.replace(/\D/g, '');
  if (soloDigitos.length === 10) {
    soloDigitos = `57${soloDigitos}`;
  }
  return `https://wa.me/${soloDigitos}?text=${encodeURIComponent(mensaje)}`;
}
