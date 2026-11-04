import { expect, test } from '@playwright/test'

const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD
const memberEmail = process.env.E2E_MEMBER_EMAIL
const memberPassword = process.env.E2E_MEMBER_PASSWORD

test.skip(!adminEmail || !adminPassword || !memberEmail || !memberPassword, 'Configure contas de teste em ambiente descartável')

test('admin cadastra serviço, membro solicita e admin confirma', async ({ browser }) => {
  const adminContext = await browser.newContext()
  const memberContext = await browser.newContext()
  const admin = await adminContext.newPage()
  const member = await memberContext.newPage()
  const unique = Date.now().toString()
  const partnerName = `Café E2E ${unique}`
  const serviceName = `Combo E2E ${unique}`

  await admin.goto('/login')
  await admin.getByLabel('E-mail').fill(adminEmail!)
  await admin.getByLabel('Senha').fill(adminPassword!)
  await admin.getByRole('button', { name: 'Entrar' }).click()
  await expect(admin).toHaveURL(/\/admin$/)

  await admin.goto('/admin/partners')
  const partnerForm = admin.locator('form').first()
  await partnerForm.locator('[name="name"]').fill(partnerName)
  await partnerForm.locator('[name="description"]').fill('Parceiro fictício do teste')
  await partnerForm.locator('[name="validFrom"]').fill('2026-01-01')
  await partnerForm.getByRole('button', { name: 'Cadastrar parceiro' }).click()
  await expect(admin.getByText(partnerName)).toBeVisible()

  await admin.goto('/admin/services')
  const serviceForm = admin.locator('form').first()
  await serviceForm.locator('[name="partnerId"]').selectOption({ label: partnerName })
  await serviceForm.locator('[name="name"]').fill(serviceName)
  await serviceForm.locator('[name="category"]').fill('Alimentação')
  await serviceForm.locator('[name="price"]').fill('25.00')
  await serviceForm.locator('[name="descriptionPt"]').fill('Serviço fictício para validar o fluxo completo.')
  await serviceForm.locator('[name="status"]').selectOption('published')
  await serviceForm.locator('[name="photo"]').setInputFiles('apps/web/public/icons/icon-192.png')
  await serviceForm.getByRole('button', { name: 'Cadastrar serviço' }).click()
  await expect(admin.getByText(serviceName)).toBeVisible()

  await member.goto('/login')
  await member.getByLabel('E-mail').fill(memberEmail!)
  await member.getByLabel('Senha').fill(memberPassword!)
  await member.getByRole('button', { name: 'Entrar' }).click()
  await expect(member).toHaveURL(/\/member$/)
  await member.getByText(serviceName).click()
  await member.getByRole('button', { name: 'Solicitar contratação' }).click()
  await expect(member.getByText('Solicitação enviada.')).toBeVisible()

  await admin.goto('/admin/orders')
  const order = admin.locator('div.rounded-2xl').filter({ hasText: serviceName }).first()
  await order.getByRole('button', { name: 'Confirmar' }).click()
  await expect(order.getByText('confirmed')).toBeVisible()
  await admin.goto('/admin')
  await expect(admin.getByText('Valor confirmado')).toBeVisible()
  await admin.goto('/admin/members')
  const memberRow = admin.locator('div.rounded-2xl').filter({ hasText: memberEmail! }).first()
  await memberRow.getByRole('button', { name: 'Desativar' }).click()
  await expect(memberRow.getByText('inactive')).toBeVisible()
  await member.goto('/member')
  await expect(member.getByText('Acesso pausado')).toBeVisible()
  await adminContext.close()
  await memberContext.close()
})
